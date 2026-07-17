
import express from 'express';
import { Kafka } from 'kafkajs';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import { Notification } from './models/Notification';

dotenv.config();

connectDB();

const app = express();
const port = process.env.PORT || 3004;
const serviceName = 'notification-service';

// Kafka Setup
const kafka = new Kafka({
  clientId: serviceName,
  brokers: [(process.env.KAFKA_BROKER || 'kafka:9092')],
  retry: {
    initialRetryTime: 100,
    retries: 3
  }
});

const consumer = kafka.consumer({ groupId: `${serviceName}-group` });
const producer = kafka.producer(); // For DLQ

const run = async () => {
  try {
    await producer.connect();
    await consumer.connect();
    console.log(`✅ ${serviceName} Kafka Consumer & Producer connected`);

    // Subscribe to topics
    await consumer.subscribe({ topic: 'auth-events', fromBeginning: false });
    await consumer.subscribe({ topic: 'complaint-events', fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const value = message.value?.toString() || '{}';

        try {
          const payload = JSON.parse(value);
          console.log(`📥 [${serviceName}] Received on ${topic}:`, payload.type);

          // ... (Process payload - same logic as before)
          if (topic === 'auth-events' && payload.type === 'USER_REGISTERED') {
            console.log(`📧 SENDING WELCOME EMAIL TO: ${payload.email}`);
            await Notification.create({
              recipient: payload.email,
              type: 'EMAIL',
              subject: 'Bienvenue sur ReclamTrack',
              content: 'Merci de votre inscription. Votre compte est actif.',
              relatedEntityId: payload.userId,
              relatedEntityType: 'User'
            });
          }

          // ── COMPLAINT_CREATED → confirmation email au déclarant ──────────
          if (topic === 'complaint-events' && payload.type === 'COMPLAINT_CREATED') {
            const { complaintId, number, category, priority, email } = payload;
            console.log(`📧 COMPLAINT_CREATED [${number}] → confirmation to ${email || 'admin'}`);

            const slaMap: Record<string, string> = {
              urgent: '4 heures', high: '24 heures', medium: '72 heures', low: '7 jours'
            };

            await Notification.create({
              recipient: email || 'admin@reclamtrack.com',
              type: 'EMAIL',
              subject: `✅ Réclamation ${number} enregistrée`,
              content: `Votre réclamation "${number}" (catégorie : ${category}) a bien été reçue.\n` +
                       `Priorité : ${priority} — Délai de traitement SLA : ${slaMap[priority] ?? 'N/A'}.\n` +
                       `Vous serez notifié à chaque mise à jour.`,
              relatedEntityId: complaintId,
              relatedEntityType: 'Complaint'
            });
          }

          // ── COMPLAINT_ASSIGNED → notif technicien ────────────────────────
          if (topic === 'complaint-events' && payload.type === 'COMPLAINT_ASSIGNED') {
            const { number, teamName, technicianName } = payload;
            console.log(`📧 COMPLAINT_ASSIGNED [${number}] → team: ${teamName}`);

            await Notification.create({
              recipient: 'dispatcher@reclamtrack.com',
              type: 'IN_APP',
              subject: `Assignation : ${number}`,
              content: `La réclamation ${number} a été assignée à ${teamName}${technicianName ? ` (technicien : ${technicianName})` : ''}.`,
              relatedEntityId: payload.complaintId,
              relatedEntityType: 'Complaint'
            });
          }

          // ── COMPLAINT_STATUS_UPDATED → email déclarant ───────────────────
          if (topic === 'complaint-events' && payload.type === 'COMPLAINT_STATUS_UPDATED') {
            const { number, oldStatus, newStatus, email } = payload;
            console.log(`📧 STATUS_UPDATED [${number}] ${oldStatus} → ${newStatus}`);

            const statusLabels: Record<string, string> = {
              'en cours': 'En cours de traitement',
              'résolue':  'Résolue ✅',
              'fermée':   'Clôturée',
              'rejetée':  'Rejetée',
            };

            await Notification.create({
              recipient: email || 'admin@reclamtrack.com',
              type: 'EMAIL',
              subject: `Mise à jour réclamation ${number}`,
              content: `Votre réclamation ${number} est désormais : ${statusLabels[newStatus] ?? newStatus}.`,
              relatedEntityId: payload.complaintId,
              relatedEntityType: 'Complaint'
            });
          }

          // ── COMPLAINT_SLA_BREACH → alerte managers ───────────────────────
          if (topic === 'complaint-events' && payload.type === 'COMPLAINT_SLA_BREACH') {
            const { number, category, priority, overdueByMs } = payload;
            const overdueH = Math.round((overdueByMs ?? 0) / 3_600_000);
            console.warn(`🚨 SLA_BREACH [${number}] — ${overdueH}h overdue`);

            await Notification.create({
              recipient: 'manager@reclamtrack.com',
              type: 'EMAIL',
              subject: `🚨 SLA dépassé — Réclamation ${number}`,
              content: `La réclamation ${number} (catégorie : ${category}, priorité : ${priority}) ` +
                       `dépasse son délai SLA de ${overdueH} heure(s).\n` +
                       `Une intervention immédiate est requise.`,
              relatedEntityId: payload.complaintId,
              relatedEntityType: 'Complaint'
            });
          }

        } catch (err) {
          console.error(`❌ Error processing message on ${topic}:`, err);

          // Send to DLQ
          const dlqTopic = `${topic}.DLQ`;
          console.log(`⚠️ Sending message to DLQ: ${dlqTopic}`);

          try {
            await producer.send({
              topic: dlqTopic,
              messages: [{
                key: message.key,
                value: message.value,
                headers: {
                  ...message.headers,
                  'error-message': (err as Error).message,
                  'original-topic': topic,
                  'failed-at': new Date().toISOString()
                }
              }]
            });
          } catch (dlqErr) {
            console.error('🔥 FATAL: Failed to send to DLQ', dlqErr);
          }
        }
      },
    });
  } catch (e) {
    console.error(`❌ ${serviceName} Kafka connection error:`, e);
  }
};

if (process.env.DISABLE_KAFKA !== 'true') {
  run();
}

app.use(express.json());

const notificationRoutes = express.Router();

notificationRoutes.post('/events', async (req, res) => {
  const { topic, ...message } = req.body;
  console.log(`📥 [HTTP] Received on ${topic}:`, message.eventType);

  const payload = message.data;

  try {
    if (topic === 'auth-events' && message.eventType === 'USER_REGISTERED') {
      console.log(`📧 SENDING WELCOME EMAIL TO: ${payload.email}`);
      await Notification.create({
        recipient: payload.email,
        type: 'EMAIL',
        subject: 'Bienvenue sur ReclamTrack',
        content: 'Merci de votre inscription...',
        relatedEntityId: payload.userId,
        relatedEntityType: 'User'
      });
    }

    if (topic === 'complaint-events' && message.eventType === 'COMPLAINT_CREATED') {
      const complaintId = payload.complaintId;
      const title = payload.title;
      const category = payload.category;

      console.log(`📧 SENDING COMPLAINT CONFIRMATION [${title}]`);
      await Notification.create({
        recipient: 'admin@reclamtrack.com',
        type: 'EMAIL',
        subject: `Nouvelle Réclamation: ${title}`,
        content: `Une nouvelle réclamation a été créée dans la catégorie ${category}`,
        relatedEntityId: complaintId,
        relatedEntityType: 'Complaint'
      });
    }

    if (topic === 'complaint-events' && message.eventType === 'COMPLAINT_STATUS_UPDATED') {
      console.log(`📧 SENDING STATUS UPDATE [${payload.complaintId}] -> ${payload.newStatus}`);
      await Notification.create({
        recipient: 'user@example.com',
        type: 'EMAIL',
        subject: `Mise à jour Réclamation`,
        content: `Votre réclamation est passée au statut : ${payload.newStatus}`,
        relatedEntityId: payload.complaintId,
        relatedEntityType: 'Complaint'
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error processing HTTP event:', err);
    res.status(500).json({ error: (err as Error).message });
  }
});

notificationRoutes.get('/', (req, res) => {
  res.json({ service: serviceName, status: 'active' });
});

app.use('/api/notifications', notificationRoutes);

app.listen(port, () => {
  console.log(`🚀 ${serviceName} listening on port ${port}`);
});

// import kafkajs from 'kafkajs';
// const { Kafka, logLevel } = kafkajs;

// MOCKED for Cloudflare Workers
const kafka: any = {
    producer: (...args: any[]) => ({
        connect: async (...a: any[]) => {},
        send: async (...a: any[]) => {},
        disconnect: async (...a: any[]) => {}
    }),
    consumer: (...args: any[]) => ({
        connect: async (...a: any[]) => {},
        subscribe: async (...a: any[]) => {},
        run: async (...a: any[]) => {},
        disconnect: async (...a: any[]) => {}
    })
};

export const producer = kafka.producer();
export const consumer = kafka.consumer();

export const connectKafka = async () => {
    try {
        console.warn('⚠️  [Kafka] MOCKED connectKafka (Workers Compat)');
    } catch (error) {
        console.error('❌ Kafka connection error:', error);
    }
};

export default kafka;

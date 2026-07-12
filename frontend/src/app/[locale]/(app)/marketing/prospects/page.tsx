'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import api from '@/lib/api';
import { Briefcase, Link as LinkIcon, Mail, User, Building2, Phone } from 'lucide-react';

export default function ProspectsPage() {
    const t = useTranslations('Marketing');
    const [isLoading, setIsLoading] = useState(false);
    const [hubspotStatus, setHubspotStatus] = useState<{ connected: boolean, message: string } | null>(null);

    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        company: '',
        linkedin_url: ''
    });

    useEffect(() => {
        checkHubspotStatus();
    }, []);

    const checkHubspotStatus = async () => {
        try {
            const res = await api.get('/integrations/hubspot/status');
            setHubspotStatus(res.data.data);
        } catch (error) {
            console.error(error);
            setHubspotStatus({ connected: false, message: 'Erreur de connexion' });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.email || !formData.firstname) {
            toast.error('Le prénom et l\'email sont requis.');
            return;
        }

        setIsLoading(true);
        try {
            const res = await api.post('/integrations/hubspot/lead', formData);
            if (res.data.success) {
                toast.success('Prospect envoyé vers HubSpot avec succès !');
                setFormData({
                    firstname: '',
                    lastname: '',
                    email: '',
                    phone: '',
                    company: '',
                    linkedin_url: ''
                });
            } else {
                toast.error(res.data.message || 'Erreur lors de l\'envoi.');
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Erreur réseau.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Prospection & CRM</h1>
                    <p className="text-muted-foreground mt-2">
                        Saisissez manuellement vos leads (ex: prospection LinkedIn) pour les synchroniser avec HubSpot.
                    </p>
                </div>
                
                <div className={`px-4 py-2 rounded-full border text-sm font-medium flex items-center gap-2 ${hubspotStatus?.connected ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                    <div className={`w-2 h-2 rounded-full ${hubspotStatus?.connected ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                    HubSpot: {hubspotStatus ? hubspotStatus.message : 'Vérification...'}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Nouveau Prospect
                    </CardTitle>
                    <CardDescription>
                        Remplissez les informations du contact pour l'ajouter automatiquement au CRM.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstname">Prénom *</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        id="firstname" name="firstname" 
                                        value={formData.firstname} onChange={handleChange} 
                                        placeholder="Ex: Jean" className="pl-9" required 
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="lastname">Nom</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        id="lastname" name="lastname" 
                                        value={formData.lastname} onChange={handleChange} 
                                        placeholder="Ex: Dupont" className="pl-9" 
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        id="email" name="email" type="email"
                                        value={formData.email} onChange={handleChange} 
                                        placeholder="jean.dupont@entreprise.com" className="pl-9" required 
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Téléphone</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        id="phone" name="phone" type="tel"
                                        value={formData.phone} onChange={handleChange} 
                                        placeholder="+33 6 12 34 56 78" className="pl-9" 
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="company">Entreprise</Label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        id="company" name="company" 
                                        value={formData.company} onChange={handleChange} 
                                        placeholder="Nom de la société" className="pl-9" 
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="linkedin_url">Profil LinkedIn</Label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        id="linkedin_url" name="linkedin_url" type="url"
                                        value={formData.linkedin_url} onChange={handleChange} 
                                        placeholder="https://linkedin.com/in/..." className="pl-9" 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t">
                            <Button type="submit" disabled={isLoading} className="gap-2">
                                <Briefcase className="w-4 h-4" />
                                {isLoading ? 'Synchronisation...' : 'Ajouter à HubSpot'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

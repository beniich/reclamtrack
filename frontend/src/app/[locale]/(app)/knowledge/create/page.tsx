'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

// Import React Quill dynamically to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function CreateSOPPage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Maintenance');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!title.trim() || !content.trim()) {
            toast.error('Title and content are required');
            return;
        }
        setIsSaving(true);
        try {
            await api.post('/api/knowledge/sops', {
                title,
                category,
                content,
                tags: tags.split(',').map((t: string) => t.trim()).filter(Boolean)
            });
            toast.success('SOP created successfully!');
            router.push('/knowledge');
        } catch (error) {
            toast.error('Failed to create SOP');
        } finally {
            setIsSaving(false);
        }
    };

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
            ['link'],
            ['clean']
        ],
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-background-dark p-8">
            <div className="max-w-5xl mx-auto w-full space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/knowledge">
                            <Button variant="outline" size="icon" className="rounded-full">
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Create Protocol (SOP)</h1>
                            <p className="text-sm text-slate-500">Draft a new Standard Operating Procedure</p>
                        </div>
                    </div>
                    <Button onClick={handleSave} disabled={isSaving} className="bg-primary hover:brightness-110">
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? 'Saving...' : 'Save Protocol'}
                    </Button>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-border-dark rounded-xl p-6 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-2">
                            <Label>Title *</Label>
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Server Migration Protocol"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Category *</Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                                    <SelectItem value="Emergency Response">Emergency Response</SelectItem>
                                    <SelectItem value="Compliance">Compliance</SelectItem>
                                    <SelectItem value="Customer Service">Customer Service</SelectItem>
                                    <SelectItem value="IT & Security">IT &amp; Security</SelectItem>
                                    <SelectItem value="RH">Ressources Humaines</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>Tags (comma separated)</Label>
                            <Input
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                placeholder="e.g. servers, migration, critical"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Content *</Label>
                        <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-white min-h-[420px]">
                            <ReactQuill
                                theme="snow"
                                value={content}
                                onChange={setContent}
                                modules={modules}
                                style={{ height: '380px' }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

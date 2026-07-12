'use client';

import { useState } from 'react';
import { Star, CheckCircle2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function FeedbackPage() {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [category, setCategory] = useState('Service');
    const [submitted, setSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) { toast.error('Please select a rating'); return; }
        if (!comment.trim()) { toast.error('Please add a comment'); return; }

        setIsLoading(true);
        try {
            await api.post('/api/feedback', { rating, comment, category, source: 'web' });
            setSubmitted(true);
        } catch (err) {
            toast.error('Failed to submit feedback');
        } finally {
            setIsLoading(false);
        }
    };

    const labels: Record<number, string> = {
        1: 'Very Dissatisfied 😞',
        2: 'Dissatisfied 😕',
        3: 'Neutral 😐',
        4: 'Satisfied 🙂',
        5: 'Very Satisfied 😄',
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-6">
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-10 shadow-xl text-center max-w-md w-full border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Thank You!</h1>
                    <p className="text-slate-500 dark:text-slate-400">Your feedback has been recorded. We use your input to continuously improve our services.</p>
                    <Button className="mt-8 bg-primary hover:brightness-110" onClick={() => { setSubmitted(false); setRating(0); setComment(''); }}>
                        Submit Another
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary to-blue-600 p-8 text-white text-center">
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-white/20 mx-auto mb-4">
                        <MessageSquare className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold">Share Your Experience</h1>
                    <p className="text-blue-100 mt-2 text-sm">Your feedback drives our improvement</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Star Rating */}
                    <div className="text-center">
                        <Label className="block mb-4 text-base font-semibold text-slate-700 dark:text-slate-300">How satisfied are you?</Label>
                        <div className="flex items-center justify-center gap-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHover(star)}
                                    onMouseLeave={() => setHover(0)}
                                    className="transition-transform hover:scale-125 focus:outline-none"
                                >
                                    <Star
                                        className={`w-10 h-10 transition-colors ${
                                            star <= (hover || rating)
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-slate-300 dark:text-slate-600'
                                        }`}
                                    />
                                </button>
                            ))}
                        </div>
                        {(hover || rating) > 0 && (
                            <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-400 h-5 transition-all">
                                {labels[hover || rating]}
                            </p>
                        )}
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Service">Service Quality</SelectItem>
                                <SelectItem value="Response">Response Time</SelectItem>
                                <SelectItem value="Technician">Technician Professionalism</SelectItem>
                                <SelectItem value="Communication">Communication</SelectItem>
                                <SelectItem value="General">General</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Comment */}
                    <div className="space-y-2">
                        <Label>Your comments *</Label>
                        <Textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Tell us about your experience in detail..."
                            rows={4}
                            className="resize-none"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-primary hover:brightness-110 py-3 text-base font-semibold"
                        disabled={isLoading || rating === 0}
                    >
                        {isLoading ? 'Submitting...' : 'Submit Feedback'}
                    </Button>
                </form>
            </div>
        </div>
    );
}

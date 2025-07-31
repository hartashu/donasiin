'use client';

import { useState, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cpu, FileImage, Type, LoaderCircle, AlertTriangle, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadReceiptImageAction } from "@/actions/action"; // Import server action

interface ShipItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (trackingInfo: { code: string, url?: string }) => void;
    itemName: string;
}

const ModeButton = ({ label, icon: Icon, isActive, onClick }: { label: string, icon: React.ElementType, isActive: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`relative flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-md flex items-center justify-center gap-2 transition-colors duration-200 outline-none ${isActive ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
    >
        <Icon size={16} />
        {label}
    </button>
);

export function ShipItemModal({ isOpen, onClose, onSubmit, itemName }: ShipItemModalProps) {
    const [mode, setMode] = useState<'ai' | 'image_manual' | 'code_only'>('ai');
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [trackingCode, setTrackingCode] = useState('');
    const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const resetState = useCallback(() => {
        setFile(null);
        setIsProcessing(false);
        setTrackingCode('');
        setReceiptUrl(null);
        setError(null);
    }, []);

    const handleModeChange = (newMode: 'ai' | 'image_manual' | 'code_only') => {
        resetState();
        setMode(newMode);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setReceiptUrl(null);
        }
    };

    // Fungsi untuk scan AI via API Route
    const handleAiScan = async () => {
        if (!file) return;
        const formData = new FormData();
        formData.append("receiptImage", file);
        setIsProcessing(true);
        setError(null);
        toast.loading('AI is scanning your receipt...');
        try {
            const res = await fetch("/api/upload", { method: "POST", body: formData });

            // Pencegahan error "not valid JSON"
            const contentType = res.headers.get("content-type");
            if (!res.ok || !contentType || !contentType.includes("application/json")) {
                const textError = await res.text();
                throw new Error(`Server error: ${res.statusText} - ${textError.slice(0, 100)}`);
            }

            const data = await res.json();
            toast.dismiss();
            setReceiptUrl(data.data.receiptUrl);
            setTrackingCode(data.data.trackingNumber || '');
            if (!data.data.trackingNumber) {
                setError("AI couldn't find the tracking number. Please enter it manually.");
                toast.error("AI couldn't find the tracking number.");
            } else {
                toast.success('AI scan successful!');
            }
        } catch (err) {
            toast.dismiss();
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsProcessing(false);
        }
    };

    // Fungsi untuk upload gambar via Server Action
    const handleImageUpload = async () => {
        if (!file) return;
        const formData = new FormData();
        formData.append("receiptImage", file);
        setIsProcessing(true);
        setError(null);
        toast.loading('Uploading image...');
        try {
            const result = await uploadReceiptImageAction(formData);
            toast.dismiss();
            if (result.success && result.url) {
                setReceiptUrl(result.url);
                toast.success('Image uploaded!');
            } else {
                throw new Error(result.error || "Image upload failed.");
            }
        } catch (err) {
            toast.dismiss();
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSubmit = () => {
        if (!trackingCode) {
            toast.error("Tracking code is required.");
            return;
        }
        onSubmit({ code: trackingCode, url: receiptUrl ?? undefined });
        resetState();
    };

    if (!isOpen) return null;

    const isSubmitDisabled = !trackingCode || isProcessing || (mode === 'image_manual' && !receiptUrl);

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white p-6 rounded-2xl w-full max-w-md space-y-5 shadow-xl relative"
                >
                    <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-800 p-1 rounded-full bg-gray-100 hover:bg-gray-200">
                        <X size={18} />
                    </button>
                    <h2 className="text-xl font-bold text-gray-800">Ship Item: <span className="font-extrabold">{itemName}</span></h2>

                    <div className="flex border border-gray-200 rounded-lg p-1 bg-gray-100 space-x-1">
                        <ModeButton label="AI Scan" icon={Cpu} isActive={mode === 'ai'} onClick={() => handleModeChange('ai')} />
                        <ModeButton label="Image+Manual" icon={FileImage} isActive={mode === 'image_manual'} onClick={() => handleModeChange('image_manual')} />
                        <ModeButton label="Code Only" icon={Type} isActive={mode === 'code_only'} onClick={() => handleModeChange('code_only')} />
                    </div>

                    {(mode === 'ai' || mode === 'image_manual') && (
                        <div className="space-y-3">
                            <label htmlFor="file-upload" className="relative block w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors">
                                <div className="flex flex-col items-center justify-center text-gray-500 min-h-[60px]">
                                    {receiptUrl ? (
                                        <Image src={receiptUrl} width={100} height={60} alt="receipt preview" className="mx-auto rounded-md object-contain" />
                                    ) : (
                                        <>
                                            <UploadCloud className="h-8 w-8 text-gray-400" />
                                            <span className="mt-2 text-sm font-semibold">{file ? file.name : 'Click to upload receipt'}</span>
                                        </>
                                    )}
                                </div>
                            </label>
                            <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} className="sr-only" disabled={isProcessing} />

                            {file && !receiptUrl && mode === 'ai' && (
                                <button onClick={handleAiScan} disabled={isProcessing} className="w-full bg-sky-600 text-white py-2 rounded-lg font-semibold hover:bg-sky-700 disabled:opacity-50 flex justify-center items-center gap-2">
                                    {isProcessing ? <LoaderCircle className="animate-spin" /> : <Cpu size={16} />}
                                    Scan with AI
                                </button>
                            )}
                            {file && !receiptUrl && mode === 'image_manual' && (
                                <button onClick={handleImageUpload} disabled={isProcessing} className="w-full bg-sky-600 text-white py-2 rounded-lg font-semibold hover:bg-sky-700 disabled:opacity-50 flex justify-center items-center gap-2">
                                    {isProcessing ? <LoaderCircle className="animate-spin" /> : <UploadCloud size={16} />}
                                    Upload Image
                                </button>
                            )}
                        </div>
                    )}

                    <div className="space-y-1">
                        <label htmlFor="tracking-code" className="block text-sm font-medium text-gray-700">Tracking Code</label>
                        <input
                            id="tracking-code"
                            type="text"
                            placeholder="Enter tracking code here"
                            value={trackingCode}
                            onChange={(e) => setTrackingCode(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-gray-800"
                        />
                    </div>

                    {error && (
                        <div className="flex items-start gap-2 text-sm text-yellow-800 bg-yellow-50 p-3 rounded-lg">
                            <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
                            <p>{error}</p>
                        </div>
                    )}

                    <button onClick={handleSubmit} disabled={isSubmitDisabled} className="w-full bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                        {isProcessing ? 'Processing...' : 'Confirm & Mark as Shipped'}
                    </button>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

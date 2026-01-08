import { X, AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react';

interface CustomDialogProps {
    isOpen: boolean;
    type: 'alert' | 'confirm' | 'success' | 'danger';
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel?: () => void;
}

export function CustomDialog({
    isOpen, type, title, message,
    confirmLabel = "Continuer",
    cancelLabel = "Annuler",
    onConfirm, onCancel
}: CustomDialogProps) {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'success': return <CheckCircle2 className="text-green-500" size={40} />;
            case 'danger': return <AlertCircle className="text-red-500" size={40} />;
            case 'alert': return <AlertCircle className="text-yellow-500" size={40} />;
            case 'confirm': return <HelpCircle className="text-purple-500" size={40} />;
        }
    };

    const getBtnClass = () => {
        switch (type) {
            case 'danger': return 'bg-red-500 hover:bg-red-600 shadow-red-100';
            case 'success': return 'bg-green-500 hover:bg-green-600 shadow-green-100';
            default: return 'bg-purple-600 hover:bg-purple-700 shadow-purple-100';
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-black/40 dark:bg-black/80 backdrop-blur-sm" onClick={onCancel} />

            <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[40px] p-8 shadow-2xl border border-white dark:border-slate-800 animate-scale-up">
                <button
                    onClick={onCancel}
                    className="absolute top-6 right-6 p-2 text-gray-300 hover:text-gray-600 dark:hover:text-white rounded-xl transition-all"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col items-center text-center space-y-6">
                    <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-3xl">
                        {getIcon()}
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tight">{title}</h3>
                        <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{message}</p>
                    </div>

                    <div className="flex flex-col w-full gap-3 pt-4">
                        <button
                            onClick={onConfirm}
                            className={`w-full py-4 text-white font-black rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-95 uppercase text-xs tracking-widest ${getBtnClass()} dark:shadow-none`}
                        >
                            {confirmLabel}
                        </button>

                        {(type === 'confirm' || type === 'danger') && (
                            <button
                                onClick={onCancel}
                                className="w-full py-4 text-gray-400 dark:text-gray-500 font-black hover:text-gray-800 dark:hover:text-white transition-colors uppercase text-[10px] tracking-widest"
                            >
                                {cancelLabel}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

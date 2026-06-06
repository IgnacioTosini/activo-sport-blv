'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'react-toastify';

export const UnauthorizedToast = ({ error }: { error?: string }) => {
    const router = useRouter();
    useEffect(() => {
        if (error === 'unauthorized') {
            toast.error('No tenés permisos para acceder al panel admin');
            router.replace('/', { scroll: false });
        }
    }, [error, router]);

    return null;
};

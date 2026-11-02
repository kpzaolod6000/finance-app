import { InputHTMLAttributes } from 'react';

export default function Checkbox({
    className = '',
    ...props
}: InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'h-4 w-4 rounded border-border bg-background text-primary shadow-none focus:ring-2 focus:ring-ring/35 focus:ring-offset-0 ' +
                className
            }
        />
    );
}

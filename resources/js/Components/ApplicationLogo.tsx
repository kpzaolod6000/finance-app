import { SVGAttributes } from 'react';

/**
 * Ledger mark — a baseline with ascending columns, drawn in currentColor.
 * Reads as an account statement growing line by line. Replaces the Laravel logo.
 */
export default function ApplicationLogo(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            {...props}
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect
                x="1.25"
                y="1.25"
                width="29.5"
                height="29.5"
                rx="7.75"
                stroke="currentColor"
                strokeOpacity="0.35"
                strokeWidth="1.5"
            />
            <path
                d="M8 23.5h16"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeOpacity="0.55"
            />
            <rect x="9" y="15" width="3.25" height="5.5" rx="1" fill="currentColor" fillOpacity="0.45" />
            <rect x="14.375" y="11" width="3.25" height="9.5" rx="1" fill="currentColor" fillOpacity="0.7" />
            <rect x="19.75" y="7" width="3.25" height="13.5" rx="1" fill="currentColor" />
        </svg>
    );
}

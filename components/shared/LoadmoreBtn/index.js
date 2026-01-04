"use client";

import styles from "./loadmorebtn.module.scss";
import { Ring } from 'ldrs/react'
import 'ldrs/react/Ring.css'
import { useContext } from 'react';
import { ThemeContext } from '@/context/ThemeContext';

export default function LoadmoreBtn({ onClick, isLoading }) {
    const { theme } = useContext(ThemeContext);
    const ringColor = theme === 'dark' ? 'white' : 'black';

    return (
        <div className={styles.loadmoreBtn}>
            <button onClick={onClick} disabled={isLoading}>
                {isLoading ? (
                    <Ring
                        size="40"
                        stroke="5"
                        bgOpacity="0"
                        speed="2"
                        color={ringColor} 
                    />
                ) : 'Load more Results'}
            </button>
        </div>
    )
}
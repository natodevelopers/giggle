'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import styles from "./style.module.scss"
import { FaUser } from "react-icons/fa"
import { useRouter } from 'next/navigation';
import { Ring } from 'ldrs/react'
import 'ldrs/react/Ring.css'
import { useContext } from 'react';
import { ThemeContext } from '@/context/ThemeContext';

export default function AccountBtn() {
    const { isLoaded, user } = useUser();
    const { openSignIn } = useClerk();
    const router = useRouter();
    const { theme } = useContext(ThemeContext);
    const ringColor = theme === 'dark' ? 'white' : 'black';

    if (!isLoaded) {
        return (
            <div className={styles.accountBtn}>
                <FaUser />
                <div className={styles.title}>
                    <Ring
                        size="40"
                        stroke="5"
                        bgOpacity="0"
                        speed="2"
                        color={ringColor} 
                    />
                </div>
            </div>
        )
    }

    if (user) {
        const UserName = user.fullName || user.firstName || user.emailAddresses[0]?.emailAddress.split('@')[0];

        return (
            <div className={styles.accountBtn} onClick={() => router.push('/account')}>
                <img src={user.imageUrl} alt="user" />
                <p className={styles.title}>{UserName}</p>
            </div>
        )
    }

    return (
        <div className={styles.accountBtn} onClick={() => openSignIn()}>
            <FaUser />
            <p className={styles.title}>Login</p>
        </div>
    )
}
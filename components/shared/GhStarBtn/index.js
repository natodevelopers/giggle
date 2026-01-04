"use client";

import { useEffect, useState } from "react";
import styles from "./ghStarBtn.module.scss";
import { FaStar } from "react-icons/fa";
import axios from "axios";


const GhStarBtn = () => {
    const [stargazers_count, setStargazers_count] = useState('--');

    useEffect(() => {
        axios.get("https://api.github.com/repos/natodevelopers/cloudrive")
            .then(res => { setStargazers_count(res.data.stargazers_count || '--'); })
            .catch(err => { console.log(err); })
    }, []);

    return (
        <a href="https://github.com/natodevelopers/" target="_blank" className={styles.ghStarBtn}>
            <span>
                <FaStar /> &nbsp; Star Us
            </span>
            <span>{stargazers_count}</span>
        </a>
    );
}

export default GhStarBtn;
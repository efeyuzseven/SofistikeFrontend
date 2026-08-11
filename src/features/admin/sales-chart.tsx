"use client";

import { useState } from "react";
import styles from "./admin-dashboard.module.css";

const chartData = {
  weekly: {
    labels: ["12 Tem", "19 Tem", "26 Tem", "2 Ağu", "9 Ağu"],
    b2c: [35, 52, 40, 62, 84],
    b2b: [10, 18, 11, 19, 24],
  },
  monthly: {
    labels: ["Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos"],
    b2c: [48, 56, 68, 72, 91],
    b2b: [17, 23, 19, 28, 34],
  },
};

function points(values: number[]) {
  return values
    .map((value, index) => `${5 + index * 23},${96 - value * 0.78}`)
    .join(" ");
}

export function SalesChart() {
  const [period, setPeriod] = useState<keyof typeof chartData>("weekly");
  const data = chartData[period];
  const b2cPoints = points(data.b2c);
  const b2bPoints = points(data.b2b);

  return (
    <section className={`${styles.card} ${styles.chartCard}`}>
      <div className={styles.cardHeading}>
        <h2>Satış Performansı</h2>
        <div className={styles.periodTabs} aria-label="Grafik dönemi">
          <button
            type="button"
            aria-pressed={period === "weekly"}
            className={period === "weekly" ? styles.activeTab : ""}
            onClick={() => setPeriod("weekly")}
          >
            Haftalık
          </button>
          <button
            type="button"
            aria-pressed={period === "monthly"}
            className={period === "monthly" ? styles.activeTab : ""}
            onClick={() => setPeriod("monthly")}
          >
            Aylık
          </button>
        </div>
      </div>
      <div className={styles.chartLegend}>
        <span className={styles.navyDot} />
        B2C <span className={styles.pinkDot} />
        B2B
      </div>
      <div className={styles.chart}>
        <div className={styles.yAxis}>
          <span>100K</span>
          <span>75K</span>
          <span>50K</span>
          <span>25K</span>
          <span>0</span>
        </div>
        <div className={styles.plot}>
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            role="img"
            aria-label={`${period === "weekly" ? "Haftalık" : "Aylık"} B2C ve B2B satış grafiği`}
          >
            <defs>
              <linearGradient id="b2c-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#092642" stopOpacity=".13" />
                <stop offset="1" stopColor="#092642" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon points={`5,96 ${b2cPoints} 97,96`} fill="url(#b2c-fill)" />
            <polyline points={b2cPoints} className={styles.b2cLine} />
            <polyline points={b2bPoints} className={styles.b2bLine} />
            {data.b2c.map((value, index) => (
              <circle
                key={`b2c-${value}-${index}`}
                cx={5 + index * 23}
                cy={96 - value * 0.78}
                r="1.3"
                className={styles.b2cPoint}
              />
            ))}
            {data.b2b.map((value, index) => (
              <circle
                key={`b2b-${value}-${index}`}
                cx={5 + index * 23}
                cy={96 - value * 0.78}
                r="1.3"
                className={styles.b2bPoint}
              />
            ))}
          </svg>
          <div className={styles.xAxis}>
            {data.labels.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

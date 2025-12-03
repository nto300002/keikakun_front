'use client';
import { useEffect, useState } from 'react';

export function LogoAnimation() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // ページ読み込み後にアニメーション開始
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-80 h-80 flex items-center justify-center">
      {/* 青い円（左から、最初は透明） */}
      <div
        className={`absolute w-32 h-32 rounded-full bg-cyan-400
          transition-all duration-1000 ease-[cubic-bezier(0.68,-0.55,0.27,1.55)]
          ${isVisible ? 'translate-x-4 opacity-100' : '-translate-x-[50vw] opacity-0'}`}
      />
      {/* 緑の円（右から、最初は透明） */}
      <div
        className={`absolute w-32 h-32 rounded-full bg-lime-500
          transition-all duration-1000 ease-[cubic-bezier(0.68,-0.55,0.27,1.55)]
          ${isVisible ? '-translate-x-4 opacity-100' : 'translate-x-[50vw] opacity-0'}`}
        style={{ transitionDelay: '0.1s' }}
      />
      {/* 中間色の円（オーバーラップ部分、徐々に浮かび上がる） */}
      <div
        className={`absolute w-20 h-20 rounded-full bg-teal-400
          transition-opacity duration-500
          ${isVisible ? 'opacity-70' : 'opacity-0'}`}
        style={{ transitionDelay: '0.8s' }}
      />
    </div>
  );
}

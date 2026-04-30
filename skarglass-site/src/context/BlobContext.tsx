import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { doc, updateDoc, serverTimestamp, addDoc, collection, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export type SkarForm = 'skar' | 'circle' | 'square' | 'triangle' | 'star';
export type SkarStyle = 'minimalism' | 'glassmorphism' | 'minimalist';

interface Point {
  x: number;
  y: number;
}

interface SkarState {
  complexity: number;
  contrast: number;
  color: string;
  path: string;
  form: SkarForm;
  styleMode: SkarStyle;
  points: Point[];
}

interface SkarContextType extends SkarState {
  setComplexity: (val: number) => void;
  setContrast: (val: number) => void;
  setColor: (val: string) => void;
  setForm: (val: SkarForm) => void;
  setStyleMode: (val: SkarStyle) => void;
  randomize: () => void;
  reset: () => void;
  saveToHistory: () => Promise<void>;
  exportData: () => string;
  importData: (json: string) => void;
}

const SkarContext = createContext<SkarContextType | undefined>(undefined);

export const useSkar = () => {
  const context = useContext(SkarContext);
  if (!context) {
    throw new Error('useSkar must be used within a SkarProvider');
  }
  return context;
};

export const SkarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [complexity, setComplexity] = useState(6);
  const [contrast, setContrast] = useState(6);
  const [color, setColor] = useState('#D74463');
  const [form, setForm] = useState<SkarForm>('skar');
  const [styleMode, setStyleMode] = useState<SkarStyle>('glassmorphism');
  const [points, setPoints] = useState<Point[]>([]);
  const [path, setPath] = useState('');
  const isInitialMount = useRef(true);

  const getPathFromPoints = useCallback((pts: Point[]) => {
    if (pts.length === 0) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length; i++) {
      const p0 = pts[i === 0 ? pts.length - 1 : i - 1];
      const p1 = pts[i];
      const p2 = pts[(i + 1) % pts.length];
      const p3 = pts[(i + 2) % pts.length];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    d += ' Z';
    return d;
  }, []);

  const generatePoints = useCallback((comp: number, cont: number, frm: SkarForm) => {
    const size = 400;
    const center = size / 2;
    const radius = size / 3;
    const pts: Point[] = [];
    const jitter = () => (Math.random() - 0.5) * (cont * 2.5);

    if (frm === 'skar') {
      const angleStep = (Math.PI * 2) / comp;
      for (let i = 0; i < comp; i++) {
        const theta = i * angleStep;
        const r = radius + jitter();
        pts.push({ x: center + r * Math.cos(theta), y: center + r * Math.sin(theta) });
      }
    } else if (frm === 'circle') {
      const circlePoints = Math.max(comp, 12);
      const angleStep = (Math.PI * 2) / circlePoints;
      for (let i = 0; i < circlePoints; i++) {
        const theta = i * angleStep;
        const r = radius + jitter();
        pts.push({ x: center + r * Math.cos(theta), y: center + r * Math.sin(theta) });
      }
    } else if (frm === 'square') {
      const half = radius;
      const corners = [
        { x: center - half, y: center - half },
        { x: center + half, y: center - half },
        { x: center + half, y: center + half },
        { x: center - half, y: center + half }
      ];
      const pointsPerSide = Math.max(Math.floor(comp / 4), 1);
      for (let i = 0; i < 4; i++) {
        const start = corners[i];
        const end = corners[(i + 1) % 4];
        for (let j = 0; j < pointsPerSide; j++) {
          const t = j / pointsPerSide;
          pts.push({ x: start.x + (end.x - start.x) * t + jitter(), y: start.y + (end.y - start.y) * t + jitter() });
        }
      }
    } else if (frm === 'triangle') {
      const corners = [
        { x: center, y: center - radius },
        { x: center + radius * Math.cos(Math.PI / 6), y: center + radius * Math.sin(Math.PI / 6) },
        { x: center - radius * Math.cos(Math.PI / 6), y: center + radius * Math.sin(Math.PI / 6) }
      ];
      const pointsPerSide = Math.max(Math.floor(comp / 3), 1);
      for (let i = 0; i < 3; i++) {
        const start = corners[i];
        const end = corners[(i + 1) % 3];
        for (let j = 0; j < pointsPerSide; j++) {
          const t = j / pointsPerSide;
          pts.push({ x: start.x + (end.x - start.x) * t + jitter(), y: start.y + (end.y - start.y) * t + jitter() });
        }
      }
    } else if (frm === 'star') {
      const pointsCount = Math.max(Math.floor(comp / 2), 3);
      const angleStep = Math.PI / pointsCount;
      for (let i = 0; i < pointsCount * 2; i++) {
        const rBase = i % 2 === 0 ? radius : radius / 2;
        const r = rBase + jitter();
        const theta = i * angleStep - Math.PI / 2;
        pts.push({ x: center + r * Math.cos(theta), y: center + r * Math.sin(theta) });
      }
    }
    return pts;
  }, []);

  const randomize = useCallback(() => {
    const newPoints = generatePoints(complexity, contrast, form);
    setPoints(newPoints);
    setPath(getPathFromPoints(newPoints));
  }, [complexity, contrast, form, generatePoints, getPathFromPoints]);

  const reset = useCallback(() => {
    setComplexity(6);
    setContrast(6);
    setColor('#D74463');
    setForm('skar');
    const newPoints = generatePoints(6, 6, 'skar');
    setPoints(newPoints);
    setPath(getPathFromPoints(newPoints));
  }, [generatePoints, getPathFromPoints]);

  // Load user preferences on login
  useEffect(() => {
    const loadPrefs = async () => {
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            if (data.lastComplexity) setComplexity(data.lastComplexity);
            if (data.lastContrast) setContrast(data.lastContrast);
            if (data.lastColor) setColor(data.lastColor);
            if (data.lastForm) setForm(data.lastForm as SkarForm);
            if (data.lastStyleMode) setStyleMode(data.lastStyleMode as SkarStyle);
          }
        } catch (error) {
          console.error("Error loading user preferences:", error);
        }
      }
    };
    loadPrefs();
  }, [user]);

  // Debounced sync to Firestore
  useEffect(() => {
    if (!user) return;
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          lastComplexity: complexity,
          lastContrast: contrast,
          lastColor: color,
          lastForm: form,
          lastStyleMode: styleMode,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error("Error updating user preferences:", error);
      }
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, [complexity, contrast, color, form, styleMode, user]);

  useEffect(() => {
    randomize();
  }, [complexity, contrast, form, randomize]);

  const saveToHistory = async () => {
    if (!user) return;
    try {
      const historyRef = collection(db, 'users', user.uid, 'history');
      await addDoc(historyRef, {
        uid: user.uid,
        path,
        color,
        complexity,
        contrast,
        form,
        styleMode,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error saving to history:", error);
    }
  };

  const exportData = () => {
    const data = {
      version: "1.1",
      app: "Skarglass",
      timestamp: new Date().toISOString(),
      parameters: {
        complexity,
        contrast,
        color,
        form,
        styleMode,
        path,
        points
      }
    };
    return JSON.stringify(data, null, 2);
  };

  const importData = (json: string) => {
    try {
      const data = JSON.parse(json);
      if (data.parameters) {
        const p = data.parameters;
        if (p.complexity) setComplexity(p.complexity);
        if (p.contrast) setContrast(p.contrast);
        if (p.color) setColor(p.color);
        if (p.form) setForm(p.form);
        if (p.styleMode) setStyleMode(p.styleMode);
        if (p.points) {
          setPoints(p.points);
          setPath(getPathFromPoints(p.points));
        } else if (p.path) {
          setPath(p.path);
        }
      }
    } catch (error) {
      console.error("Failed to import Skar data:", error);
    }
  };

  return (
    <SkarContext.Provider value={{ 
      complexity, 
      contrast, 
      color, 
      path, 
      form,
      styleMode,
      points,
      setComplexity, 
      setContrast, 
      setColor, 
      setForm,
      setStyleMode,
      randomize,
      reset,
      saveToHistory,
      exportData,
      importData
    }}>
      {children}
    </SkarContext.Provider>
  );
};

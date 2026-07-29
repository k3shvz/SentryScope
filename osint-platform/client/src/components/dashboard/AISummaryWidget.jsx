import { useState, useEffect, useRef, useMemo } from 'react';
import { FiCpu } from 'react-icons/fi';
import Card from '../ui/Card';

function buildSummarySentences(investigations) {
  if (!investigations.length) {
    return ['No investigations yet this session — run a scan to see a summary here.'];
  }

  const sentences = [];
  const total = investigations.length;
  const moduleSet = new Set(investigations.map((i) => i.type).filter(Boolean));
  sentences.push(
    `${total} investigation${total === 1 ? '' : 's'} run this session across ${moduleSet.size} module${moduleSet.size === 1 ? '' : 's'}.`
  );

  const highRisk = investigations.filter((i) => i.risk === 'high');
  if (highRisk.length) {
    sentences.push(
      `${highRisk.length} flagged high risk — most recently ${highRisk[0].target || 'an unnamed target'}.`
    );
  } else {
    sentences.push('No high-risk findings flagged in this session.');
  }

  const counts = {};
  investigations.forEach((i) => {
    if (i.type) counts[i.type] = (counts[i.type] || 0) + 1;
  });
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  if (top) {
    sentences.push(`Most active module: ${top[0]} (${top[1]} scan${top[1] === 1 ? '' : 's'}).`);
  }

  return sentences;
}

export default function AISummaryWidget({ investigations = [] }) {
  const sentences = useMemo(() => buildSummarySentences(investigations), [investigations]);
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const charIndexRef = useRef(0);
  const timeoutRef = useRef(null);

  useEffect(() => {
    setSentenceIndex(0);
  }, [investigations.length]);

  useEffect(() => {
    setIsTyping(true);
    charIndexRef.current = 0;
    setDisplayedText('');

    const sentence = sentences[sentenceIndex % sentences.length];

    const typeNext = () => {
      if (charIndexRef.current < sentence.length) {
        setDisplayedText(sentence.slice(0, charIndexRef.current + 1));
        charIndexRef.current += 1;
        timeoutRef.current = setTimeout(typeNext, 18);
      } else {
        setIsTyping(false);
      }
    };

    typeNext();

    return () => clearTimeout(timeoutRef.current);
  }, [sentenceIndex, sentences]);

  useEffect(() => {
    if (isTyping || sentences.length <= 1) return;
    const timer = setTimeout(() => {
      setSentenceIndex((prev) => (prev + 1) % sentences.length);
    }, 6000);
    return () => clearTimeout(timer);
  }, [isTyping, sentences.length]);

  return (
    <Card>
      <div className="mb-3 flex items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1">
          <FiCpu className="text-accent" size={13} />
          <span className="text-[11px] font-mono font-semibold text-accent uppercase tracking-wider">Summary</span>
        </div>
      </div>

      <div className="min-h-[48px]">
        <p className="text-sm leading-relaxed text-text-muted">
          {displayedText}
          {isTyping && (
            <span className="inline-block h-4 w-0.5 translate-y-0.5 animate-pulse bg-text" aria-hidden="true" />
          )}
        </p>
      </div>
    </Card>
  );
}

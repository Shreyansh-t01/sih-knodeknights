import { useState, useEffect } from 'react';

export function useTypewriter({
  words = [],
  typeSpeed = 80,
  deleteSpeed = 45,
  delayBetween = 2000,
  loop = true
}) {
  const [text, setText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!words.length) return;

    const currentWord = words[wordIndex % words.length];

    let timer;

    if (!isDeleting) {
      if (text.length < currentWord.length) {
        timer = setTimeout(() => {
          setText(currentWord.slice(0, text.length + 1));
        }, typeSpeed);
      } else {
        // Finished typing word, wait before deleting
        if (loop || wordIndex < words.length - 1) {
          timer = setTimeout(() => {
            setIsDeleting(true);
          }, delayBetween);
        }
      }
    } else {
      if (text.length > 0) {
        timer = setTimeout(() => {
          setText(currentWord.slice(0, text.length - 1));
        }, deleteSpeed);
      } else {
        // Finished deleting, go to next word
        setIsDeleting(false);
        setWordIndex((prev) => prev + 1);
      }
    }

    return () => clearTimeout(timer);
  }, [text, isDeleting, wordIndex, words, typeSpeed, deleteSpeed, delayBetween, loop]);

  return text;
}

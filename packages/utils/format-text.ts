export const formatText = (text: string) => {
  // add some random emoji to the text every 3 words
  const words = text.split(" ");
  const formattedWords = words.map((word, index) => {
    if (index % 3 === 0) {
      return `${word} ${Math.random() > 0.5 ? "👍" : "👎"}`;
    }
    return word;
  });
  return formattedWords.join(" ");
};

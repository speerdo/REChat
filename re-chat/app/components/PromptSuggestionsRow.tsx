import PromptSuggestionButton from "./PromptSuggestionButton";

const PromptSuggestionsRow = ({ onPromptClick }: { onPromptClick: (prompt: string) => void }) => {
  const prompts = [
    "What is the average price of a house in Hamilton County?",
    "How long does it take to sell a house in Hamilton County?",
    "What is the best way to sell a house in Hamilton County?"
  ];

  return (
    <div className='prompt-suggestions-row'>
      {prompts.map((prompt, index) => (
        <PromptSuggestionButton key={`suggestion-${index}`} text={prompt} onClick={() => onPromptClick(prompt)} />
      ))}
    </div>
  )
}

export default PromptSuggestionsRow;


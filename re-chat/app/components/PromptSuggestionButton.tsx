const PromptSuggestionButton = ({ text, onClick }: { text: string, onClick: () => void }) => {
  return (
    <button className="prompt-suggestion-button" onClick={onClick}>
      <span className="prompt-suggestion-button-text">{text}</span>
    </button>
  );
};

export default PromptSuggestionButton;

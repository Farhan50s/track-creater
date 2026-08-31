interface QuizOptionProps {
  index: number;
  text: string;
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

export function QuizOption({ index, text, isSelected, onSelect, disabled = false }: QuizOptionProps) {
  const letter = OPTION_LETTERS[index] || String.fromCharCode(65 + index);

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      style={{
        ...styles.optionButton,
        ...(isSelected ? styles.selectedButton : {}),
      }}
      aria-pressed={isSelected}
    >
      <span
        style={{
          ...styles.letterBadge,
          ...(isSelected ? styles.selectedLetterBadge : {}),
        }}
      >
        {letter}
      </span>
      <span style={styles.optionText}>{text}</span>
    </button>
  );
}

const styles: Record<string, React.CSSProperties> = {
  optionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    width: '100%',
    padding: '16px 20px',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s ease',
  },
  selectedButton: {
    borderColor: 'var(--accent-primary)',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    boxShadow: '0 0 0 1px var(--accent-primary)',
  },
  letterBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
    fontSize: '13px',
    fontWeight: '700',
    flexShrink: 0,
    transition: 'all 0.15s ease',
  },
  selectedLetterBadge: {
    backgroundColor: 'var(--accent-primary)',
    borderColor: 'var(--accent-primary)',
    color: '#ffffff',
  },
  optionText: {
    fontSize: '15px',
    color: 'var(--text-primary)',
    lineHeight: '1.5',
    flex: 1,
  },
};

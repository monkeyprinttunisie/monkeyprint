const IconButton = ({
  iconSrc,
  altText,
  classN,
  onClick,
  onDoubleClick,
  onTouchStart,
}: {
  iconSrc: string;
  altText: string;
  classN?: string;
  onClick?: () => void;
  onDoubleClick?: () => void;
  onTouchStart?: (event: React.TouchEvent<HTMLButtonElement>) => void;

}) => (
  <button className={classN} onClick={onClick} onDoubleClick={onDoubleClick} onTouchStart={onTouchStart}>
    <img
      src={iconSrc}
      alt={altText}
      className="w-8 h-8  transition-transform duration-300 transform hover:scale-150 pointer-events-none"
    />
  </button>
);
export default IconButton;
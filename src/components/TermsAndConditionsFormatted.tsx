import {
  TERMS_AND_CONDITIONS_PARAGRAPHS,
  TERMS_FULL_BOLD_EXACT,
  isTermsShortColonHeading,
} from '../constants/termsAndConditionsEnrollment';

const pBase = 'mb-2 last:mb-0 text-sm leading-snug';

function TermsParagraph({ text }: { text: string }) {
  if (TERMS_FULL_BOLD_EXACT.has(text)) {
    return <p className={`${pBase} font-semibold text-gray-900`}>{text}</p>;
  }

  if (isTermsShortColonHeading(text)) {
    return <p className={`${pBase} font-semibold text-gray-900`}>{text}</p>;
  }

  if (text.startsWith('For example:')) {
    const rest = text.slice('For example:'.length);
    return (
      <p className={`${pBase} text-gray-700`}>
        <span className="font-semibold text-gray-900">For example:</span>
        {rest}
      </p>
    );
  }

  if (text.startsWith('11A.')) {
    return (
      <p className={`${pBase} text-gray-700`}>
        <span className="font-semibold text-gray-900">11A.</span>
        {text.slice(4)}
      </p>
    );
  }

  const numbered = text.match(/^(\d{1,2}\.\s[^.]+\.)([\s\S]*)$/);
  if (numbered) {
    return (
      <p className={`${pBase} text-gray-700`}>
        <span className="font-semibold text-gray-900">{numbered[1]}</span>
        {numbered[2]}
      </p>
    );
  }

  return <p className={`${pBase} text-gray-700`}>{text}</p>;
}

export function TermsAndConditionsFormatted() {
  return (
    <>
      {TERMS_AND_CONDITIONS_PARAGRAPHS.map((paragraph, index) => (
        <TermsParagraph key={index} text={paragraph} />
      ))}
    </>
  );
}

type NoteTitleProps = {
  title: string
  sourceUrl: string | null
}

export function NoteTitle({ title, sourceUrl }: NoteTitleProps) {
  if (sourceUrl) {
    return (
      <a
        href={sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[24px] font-semibold leading-tight text-surface-800 hover:text-ember-500 hover:underline"
      >
        {title}
      </a>
    )
  }

  return (
    <h1 className="text-[24px] font-semibold leading-tight text-surface-800">{title}</h1>
  )
}

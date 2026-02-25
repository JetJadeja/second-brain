type DistillationContentProps = {
  text: string
}

export function DistillationContent({ text }: DistillationContentProps) {
  return (
    <div className="border-l-2 border-green-500 pl-4">
      <p className="text-[17px] leading-[1.8] text-surface-600">{text}</p>
    </div>
  )
}

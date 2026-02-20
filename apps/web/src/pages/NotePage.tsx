import { useParams } from 'react-router-dom'

export default function NotePage() {
  const { noteId } = useParams<{ noteId: string }>()

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-text-primary">Note</h1>
      <p className="text-sm text-text-tertiary">Note ID: {noteId}</p>
    </div>
  )
}

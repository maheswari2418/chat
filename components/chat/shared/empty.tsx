interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
}

export default function EmptyState({
  icon,
  title,
  description,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-sm">{description}</p>
    </div>
  );
}
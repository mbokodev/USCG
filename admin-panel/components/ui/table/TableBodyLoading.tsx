export interface TableBodyLoadingProps {
  rows?: number;
  columns?: number;
}

export function TableBodyLoading({
  rows = 5,
  columns = 5,
}: TableBodyLoadingProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="animate-pulse">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={colIndex} className="px-4 py-4">
              <div className="h-4 bg-neutral-200 rounded w-3/4" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

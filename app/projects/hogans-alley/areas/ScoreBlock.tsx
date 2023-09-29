export default function ScoreBlock ( {children}: {children: JSX.Element} ) {
  return (
    <div className="bg-black row-span-3-4 grid grid-cols-score-block grid-rows-score-block h-full w-full">
      <div className="col-span-3-4 row-span-3-4 bg-gray h-full w-full">
        {children}
      </div>
      <span className="col-span-1-2 row-span-1-2 bg-gray h-full w-full"></span>
      <span className="col-span-2-3 row-span-3-4 bg-gray h-full w-full"></span>
      <span className="col-span-3-4 row-span-2-3 bg-gray h-full w-full"></span>
      <span className="col-span-4-5 row-span-3-4 bg-gray h-full w-full"></span>
      <span className="col-span-5-6 row-span-1-2 bg-gray h-full w-full"></span>
    </div>
  )
}
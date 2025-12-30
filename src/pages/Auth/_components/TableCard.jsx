const TableCard = ({ title, columns, data }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 p-5">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr>
              {columns.map((col) => (
                <th key={col} className="px-4 py-2 text-gray-600 font-medium">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data?.length ? (
              data.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 border-b">
                  {columns.map((col) => (
                    <td key={col} className="px-4 py-2 text-gray-700">
                      {row[col] ?? "-"}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center text-gray-400 py-6"
                >
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableCard;

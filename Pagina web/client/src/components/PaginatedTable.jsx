import { useState, useEffect } from 'react';
import { Table, Pagination, Spinner, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react";
import PropTypes from 'prop-types';

/**
 * PaginatedTable Component
 * @param {Object} props
 * @param {string} props.endpoint - API endpoint to fetch data from
 * @param {Array<{key: string, label: string}>} props.columns - Array of column definitions
 * @returns {JSX.Element} Rendered component
 */
export default function PaginatedTable({ endpoint, columns }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching from:', `http://localhost:3000${endpoint}?page=${page}&pageSize=${rowsPerPage}`);
        
        const response = await fetch(`http://localhost:3000${endpoint}?page=${page}&pageSize=${rowsPerPage}`);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Received data:', result);
        
        setData(result.data || []);
        setTotalPages(result.pagination?.totalPages || 1);
      } catch (error) {
        console.error('Detailed error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [page, endpoint]);

  if (loading) return <Spinner label="Loading..." />;
  if (error) return <div>Error: {error}</div>;
  if (!data || data.length === 0) return <div>No data available</div>;

  return (
    <div className="w-full">
      <Table
        aria-label="Example table with dynamic content"
        bottomContent={
          <div className="flex w-full justify-center">
            <Pagination
              isCompact
              showControls
              showShadow
              color="secondary"
              page={page}
              total={totalPages}
              onChange={(newPage) => setPage(newPage)}
            />
          </div>
        }
        classNames={{
          wrapper: "min-h-[222px]",
        }}
      >
        <TableHeader>
          {columns.map((column) => (
            <TableColumn key={column.key}>{column.label}</TableColumn>
          ))}
        </TableHeader>
        <TableBody items={data}>
          {(item) => (
            <TableRow key={item.id}>
              {columns.map((column) => (
                <TableCell key={column.key}>{item[column.key]}</TableCell>
              ))}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

PaginatedTable.propTypes = {
  endpoint: PropTypes.string.isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
};
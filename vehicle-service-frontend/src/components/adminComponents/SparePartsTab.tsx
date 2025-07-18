import React, { useState, useEffect, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  
  flexRender,
} from '@tanstack/react-table';
import type {  ColumnDef,
  ColumnFiltersState,
  SortingState} from '@tanstack/react-table';
import styles from '../adminComponents/styles/styles.module.css';
import {
  fetchSpareParts,
  createSparePart,
  updateSparePart,
  deleteSparePart,
  uploadImage
} from '../../services/sparePartApi';
import ConfirmationDialog from '../adminComponents/ConfirmationDialog';

interface SparePart {
  id: string;
  name: string;
  price?: number;
  quantity?: number;
  picture?: string;
  criticalLevel: boolean;
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.errorContainer}>
          <h3>Something went wrong</h3>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const SparePartsTab: React.FC = () => {
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<SparePart, 'id'>>({
    name: '',
    price: 0,
    quantity: 0,
    picture: '',
    criticalLevel: false
  });
  const [image, setImage] = useState<File | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const loadSpareParts = async () => {
      try {
        const data = await fetchSpareParts();
        const sanitizedData = data.map(part => ({
          ...part,
          price: typeof part.price === 'number' ? part.price : 0,
          quantity: typeof part.quantity === 'number' ? part.quantity : 0
        }));
        setSpareParts(sanitizedData);
      } catch (err) {
        setError('Failed to load spare parts');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadSpareParts();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleUploadImage = async () => {
    if (!image) return;
    try {
      const imageUrl = await uploadImage(image);
      setFormData(prev => ({ ...prev, picture: imageUrl }));
      showToast('Image uploaded successfully', 'success');
    } catch (err) {
      setError('Failed to upload image');
      console.error(err);
      showToast('Failed to upload image', 'error');
    }
  };

  const handleAdd = async () => {
    try {
      const newPart = await createSparePart({
        ...formData,
        price: formData.price ?? 0,
        quantity: formData.quantity ?? 0,
      });
      setSpareParts([...spareParts, newPart]);
      resetForm();
      showToast('Spare part added successfully', 'success');
    } catch (err: any) {
      showToast(`Failed to add spare part: ${err.message}`, 'error');
    }
  };

  const handleEdit = (part: SparePart) => {
    setEditingId(part.id);
    setFormData({
      name: part.name,
      price: part.price ?? 0,
      quantity: part.quantity ?? 0,
      picture: part.picture || '',
      criticalLevel: part.criticalLevel
    });
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    try {
      const updatedPart = await updateSparePart(editingId, formData);
      setSpareParts(spareParts.map(p => (p.id === editingId ? { ...updatedPart, price: updatedPart.price ?? 0, quantity: updatedPart.quantity ?? 0 } : p)));
      resetForm();
      showToast('Spare part updated successfully', 'success');
    } catch (err: any) {
      showToast(`Failed to update spare part: ${err.message}`, 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteSparePart(deleteId);
      setSpareParts(spareParts.filter(p => p.id !== deleteId));
      showToast('Spare part deleted successfully', 'success');
      setShowDeleteDialog(false);
      setDeleteId(null);
    } catch (err: any) {
      showToast(`Failed to delete spare part: ${err.message}`, 'error');
      setError(`Failed to delete spare part: ${err.message}`);
      setShowDeleteDialog(false);
      setDeleteId(null);
    }
  };

  const openDeleteDialog = (id: string) => {
    setDeleteId(id);
    setShowDeleteDialog(true);
  };

  const closeDeleteDialog = () => {
    setShowDeleteDialog(false);
    setDeleteId(null);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: '',
      price: 0,
      quantity: 0,
      picture: '',
      criticalLevel: false
    });
    setImage(null);
  };

  const columns = useMemo<ColumnDef<SparePart>[]>(() => [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: info => <span className={styles.cellText}>{info.getValue() as string}</span>,
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: info => (
        <span className={styles.priceCell}>
          {info.getValue() !== undefined ? `KES ${Number(info.getValue()).toFixed(2)}` : 'N/A'}
        </span>
      ),
    },
    {
      accessorKey: 'quantity',
      header: 'Quantity',
      cell: info => (
        <span className={Number(info.getValue()) <= 5 ? styles.lowStock : styles.inStock}>
          {info.getValue() as number}
        </span>
      ),
    },
    {
      accessorKey: 'criticalLevel',
      header: 'Critical Level',
      cell: info => (
        <span className={info.getValue() ? styles.criticalYes : styles.criticalNo}>
          {info.getValue() ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      accessorKey: 'picture',
      header: 'Image',
      cell: info => (
        <div className={styles.imageTableCell}>
          {info.getValue() ? (
            <img
              src={info.getValue() as string}
              alt="Part"
              className={styles.tableImage}
              onClick={() => {
                setSelectedImage(info.getValue() as string);
                setShowModal(true);
              }}
            />
          ) : (
            'No image'
          )}
        </div>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className={styles.actionButtons}>
          <button 
            onClick={() => handleEdit(row.original)} 
            className={styles.editButton}
            aria-label="Edit"
          >
            Edit
          </button>
          <button 
            onClick={() => openDeleteDialog(row.original.id)} 
            className={styles.deleteButton}
            aria-label="Delete"
          >
            Delete
          </button>
        </div>
      ),
    }
  ], []);

  const table = useReactTable({
    data: spareParts,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: true,
  });

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <ErrorBoundary>
      <div className={styles.tabContent}>
        <h2 className={styles.sectionTitle}>Manage Spare Parts</h2>

        {/* Form Section */}
        <div className={styles.formSection}>
          <div className={styles.formRow}>
            <input
              name="name"
              placeholder="Part Name"
              value={formData.name}
              onChange={handleInputChange}
              className={styles.inputField}
            />
            <input
              name="price"
              type="number"
              placeholder="Enter Price (e.g., 29.99)"
              value={formData.price}
              onChange={handleInputChange}
              className={styles.inputField}
              min="0"
              step="0.01"
            />
          </div>

          <div className={styles.formRow}>
            <input
              name="quantity"
              type="number"
              placeholder="Enter Quantity (e.g., 10)"
              value={formData.quantity}
              onChange={handleInputChange}
              className={styles.inputField}
              min="0"
            />
            
            <div className={styles.fileUpload}>
              <input
                type="file"
                onChange={handleImageChange}
                className={styles.fileInput}
                accept="image/*"
                id="part-image"
              />
              <label htmlFor="part-image" className={styles.fileLabel}>
                {image ? image.name : 'Choose Image'}
              </label>
              <button 
                onClick={handleUploadImage} 
                className={styles.uploadButton}
                disabled={!image}
              >
                Upload
              </button>
            </div>
          </div>

          <div className={styles.formRow}>
            <label className={styles.checkboxContainer}>
              <input
                name="criticalLevel"
                type="checkbox"
                checked={formData.criticalLevel}
                onChange={handleInputChange}
              />
              <span className={styles.checkboxLabel}>Critical Level</span>
            </label>

            <div className={styles.formActions}>
              {editingId && (
                <button 
                  onClick={resetForm}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
              )}
              <button 
                onClick={editingId ? handleUpdate : handleAdd}
                className={styles.saveButton}
                disabled={!formData.name}
              >
                {editingId ? 'Update Part' : 'Add Part'}
              </button>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className={styles.tableContainer}>
          <table className={styles.dataTable}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id}>
                      <div
                        className={styles.headerContent}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: ' ↑',
                          desc: ' ↓',
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className={styles.pagination}>
            <button 
              onClick={() => table.setPageIndex(0)} 
              disabled={!table.getCanPreviousPage()}
              className={styles.pageButton}
            >
              «
            </button>
            <button 
              onClick={() => table.previousPage()} 
              disabled={!table.getCanPreviousPage()}
              className={styles.pageButton}
            >
              ‹
            </button>
            <span className={styles.pageInfo}>
              Page <strong>{table.getState().pagination.pageIndex + 1}</strong> of{' '}
              <strong>{table.getPageCount()}</strong>
            </span>
            <button 
              onClick={() => table.nextPage()} 
              disabled={!table.getCanNextPage()}
              className={styles.pageButton}
            >
              ›
            </button>
            <button 
              onClick={() => table.setPageIndex(table.getPageCount() - 1)} 
              disabled={!table.getCanNextPage()}
              className={styles.pageButton}
            >
              »
            </button>
          </div>
        </div>

        {/* Modal for Full-Size Image */}
        {showModal && (
          <div
            className={styles.imageModal}
            onClick={() => setShowModal(false)}
          >
            <div className={styles.modalContent}>
              <img
                src={selectedImage || ''}
                alt="Full-size spare part"
                className={styles.fullImage}
              />
              <button
                onClick={() => setShowModal(false)}
                className={styles.closeButton}
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={showDeleteDialog}
          onConfirm={handleDelete}
          onCancel={closeDeleteDialog}
          title="Confirm Deletion"
          message="Are you sure you want to delete this spare part?"
        />

        {/* Toast Notification */}
        {toast && (
          <div className={`${styles.toast} ${styles[toast.type]}`}>
            {toast.message}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default SparePartsTab;

















// import React, { useState, useEffect, useMemo } from 'react';
// import {
//   useTable,
//   useSortBy,
//   useFilters,
//   usePagination,
// } from 'react-table';


// import type {
//   Column,
//   Row,
//   TableInstance,
//   HeaderGroup,
//   ColumnInstance
// } from 'react-table';

// import styles from '../adminComponents/styles/styles.module.css';
// import {
//   fetchSpareParts,
//   createSparePart,
//   updateSparePart,
//   deleteSparePart,
//   uploadImage
// } from '../../services/sparePartApi';
// import ConfirmationDialog from '../adminComponents/ConfirmationDialog';

// // Define types
// interface SparePart {
//   id: string;
//   name: string;
//   price?: number;
//   quantity?: number;
//   picture?: string;
//   criticalLevel: boolean;
// }

// // ErrorBoundary component
// class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
//   state = { hasError: false };

//   static getDerivedStateFromError() {
//     return { hasError: true };
//   }

//   componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
//     console.error("Error caught by ErrorBoundary:", error, errorInfo);
//   }

//   render() {
//     if (this.state.hasError) {
//       return (
//         <div className={styles.errorContainer}>
//           <h3>Something went wrong</h3>
//           <button onClick={() => window.location.reload()}>Reload Page</button>
//         </div>
//       );
//     }
//     return this.props.children;
//   }
// }

// // Component for SparePartsTab
// const SparePartsTab: React.FC = () => {
//   const [spareParts, setSpareParts] = useState<SparePart[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [formData, setFormData] = useState<Omit<SparePart, 'id' | 'createdAt' | 'updatedAt'>>({
//   name: '',
//   price: 0, // Default to 0 instead of undefined
//   quantity: 0, // Default to 0 instead of undefined
//   picture: '',
//   criticalLevel: false
// });
//   // const [formData, setFormData] = useState<Omit<SparePart, 'id'>>({
//   //   name: '',
//   //   price: undefined,
//   //   quantity: undefined,
//   //   picture: '',
//   //   criticalLevel: false
//   // });
//   const [image, setImage] = useState<File | null>(null);
//   const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
//   const [showModal, setShowModal] = useState(false);
//   const [selectedImage, setSelectedImage] = useState<string | null>(null);
//   const [showDeleteDialog, setShowDeleteDialog] = useState(false);
//   const [deleteId, setDeleteId] = useState<string | null>(null);

//   const showToast = (message: string, type: 'success' | 'error') => {
//     setToast({ message, type });
//     setTimeout(() => setToast(null), 3000);
//   };

//   // Fetch spare parts on mount
//   useEffect(() => {
//     const loadSpareParts = async () => {
//       try {
//         const data = await fetchSpareParts();
//         const sanitizedData = data.map(part => ({
//           ...part,
//           price: typeof part.price === 'number' ? part.price : undefined,
//           quantity: typeof part.quantity === 'number' ? part.quantity : undefined
//         }));
//         setSpareParts(sanitizedData);
//       } catch (err) {
//         setError('Failed to load spare parts');
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadSpareParts();
//   }, []);

//   // Handle form input changes
//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value, type, checked } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : type === 'number' ? (value === '' ? undefined : parseFloat(value)) : value
//     }));
//   };

//   // Handle image file selection
//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files?.[0]) {
//       setImage(e.target.files[0]);
//     }
//   };

//   // Upload image
//   const handleUploadImage = async () => {
//     if (!image) return;
//     try {
//       const imageUrl = await uploadImage(image);
//       setFormData(prev => ({ ...prev, picture: imageUrl }));
//       showToast('Image uploaded successfully', 'success');
//     } catch (err) {
//       setError('Failed to upload image');
//       console.error(err);
//       showToast('Failed to upload image', 'error');
//     }
//   };
  

//   // CRUD operations
//   const handleAdd = async () => {
//     try {
//       //const newPart = await createSparePart(formData);
//       const newPart=await createSparePart({
//   ...formData,
//   price: formData.price ?? 0,
//   quantity: formData.quantity ?? 0,
// });

//       setSpareParts([...spareParts, newPart]);
//       resetForm();
//       showToast('Spare part added successfully', 'success');
//     } catch (err: any) {
//       showToast(`Failed to add spare part: ${err.message}`, 'error');
//     }
//   };

//   const handleEdit = (part: SparePart) => {
//     setEditingId(part.id);
//     setFormData({
//       name: part.name,
//       price: part.price,
//       quantity: part.quantity,
//       picture: part.picture || '',
//       criticalLevel: part.criticalLevel
//     });
//   };

//   const handleUpdate = async () => {
//     if (!editingId) return;
//     try {
//       const updatedPart = await updateSparePart(editingId, formData);
//       setSpareParts(spareParts.map(p => (p.id === editingId ? { ...updatedPart, price: updatedPart.price, quantity: updatedPart.quantity } : p)));
//       resetForm();
//       showToast('Spare part updated successfully', 'success');
//     } catch (err: any) {
//       showToast(`Failed to update spare part: ${err.message}`, 'error');
//     }
//   };

//   const handleDelete = async () => {
//     if (!deleteId) return;
//     try {
//       await deleteSparePart(deleteId);
//       setSpareParts(spareParts.filter(p => p.id !== deleteId));
//       showToast('Spare part deleted successfully', 'success');
//       setShowDeleteDialog(false);
//       setDeleteId(null);
//       gotoPage(0); // Reset to first page after deletion
//     } catch (err: any) {
//       showToast(`Failed to delete spare part: ${err.message}`, 'error');
//       setError(`Failed to delete spare part: ${err.message}`);
//       setShowDeleteDialog(false);
//       setDeleteId(null);
//     }
//   };

//   const openDeleteDialog = (id: string) => {
//     setDeleteId(id);
//     setShowDeleteDialog(true);
//   };

//   const closeDeleteDialog = () => {
//     setShowDeleteDialog(false);
//     setDeleteId(null);
//   };

//   const resetForm = () => {
//     setEditingId(null);
//     setFormData({
//       name: '',
//       price: undefined,
//       quantity: undefined,
//       picture: '',
//       criticalLevel: false
//     });
//     setImage(null);
//   };

//   // Table configuration
//   const columns: Column<SparePart>[] = useMemo(() => [
//     {
//       Header: 'Name',
//       accessor: 'name',
//       Filter: DefaultColumnFilter,
//       Cell: ({ value }: { value: string }) => <span className={styles.cellText}>{value}</span>
//     },
//     {
//       Header: 'Price',
//       accessor: 'price',
//       Cell: ({ value }: { value: number | undefined }) => (
//         <span className={styles.priceCell}>
//           {value !== undefined ? `KES ${value.toFixed(2)}` : 'N/A'}
//         </span>
//       ),
//       Filter: NumberRangeColumnFilter,
//       filter: 'between'
//     },
//     {
//       Header: 'Quantity',
//       accessor: 'quantity',
//       Filter: NumberRangeColumnFilter,
//       filter: 'between',
//       Cell: ({ value }: { value: number | undefined }) => (
//         <span className={value !== undefined && value <= 5 ? styles.lowStock : styles.inStock}>
//           {value !== undefined ? value : 'N/A'}
//         </span>
//       )
//     },
//     {
//       Header: 'Critical Level',
//       accessor: 'criticalLevel',
//       Cell: ({ value }: { value: boolean }) => (
//         <span className={value ? styles.criticalYes : styles.criticalNo}>
//           {value ? 'Yes' : 'No'}
//         </span>
//       ),
//       Filter: SelectColumnFilter,
//       filter: 'equals'
//     },
//     {
//       Header: 'Image',
//       accessor: 'picture',
//       Cell: ({ value }: { value: string | undefined }) => (
//         <div className={styles.imageTableCell}>
//           {value ? (
//             <img
//               src={value}
//               alt="Part"
//               className={styles.tableImage}
//               onClick={() => {
//                 setSelectedImage(value);
//                 setShowModal(true);
//               }}
//             />
//           ) : (
//             'No image'
//           )}
//         </div>
//       )
//     },
//     {
//       Header: 'Actions',
//       id: 'actions',
//       Cell: ({ row }: { row: Row<SparePart> }) => (
//         <div className={styles.actionButtons}>
//           <button 
//             onClick={() => handleEdit(row.original)} 
//             className={styles.editButton}
//             aria-label="Edit"
//           >
//             Edit
//           </button>
//           <button 
//             onClick={() => openDeleteDialog(row.original.id)} 
//             className={styles.deleteButton}
//             aria-label="Delete"
//           >
//             Delete
//           </button>
//         </div>
//       )
//     }
//   ], []);

//   const data = useMemo(() => spareParts, [spareParts]);

//   const {
//     getTableProps,
//     getTableBodyProps,
//     headerGroups,
//     prepareRow,
//     page,
//     canPreviousPage,
//     canNextPage,
//     pageOptions,
//     pageCount,
//     gotoPage,
//     nextPage,
//     previousPage,
//     state: { pageIndex }
//   } = useTable<SparePart>(
//     {
//       columns,
//       data,
//       initialState: { pageSize: 5 }
//     },
//     useFilters,
//     useSortBy,
//     usePagination
//   ) as TableInstance<SparePart>;

//   if (loading) return <div className={styles.loading}>Loading...</div>;
//   if (error) return <div className={styles.error}>{error}</div>;

//   return (
//     <ErrorBoundary>
//       <div className={styles.tabContent}>
//         <h2 className={styles.sectionTitle}>Manage Spare Parts</h2>

//         {/* Form Section */}
//         <div className={styles.formSection}>
//           <div className={styles.formRow}>
//             <input
//               name="name"
//               placeholder="Part Name"
//               value={formData.name}
//               onChange={handleInputChange}
//               className={styles.inputField}
//             />
//             <input
//               name="price"
//               type="number"
//               placeholder="Enter Price (e.g., 29.99)"
//               value={formData.price ?? ''}
//               onChange={handleInputChange}
//               className={styles.inputField}
//               min="0"
//               step="0.01"
//             />
//           </div>

//           <div className={styles.formRow}>
//             <input
//               name="quantity"
//               type="number"
//               placeholder="Enter Quantity (e.g., 10)"
//               value={formData.quantity ?? ''}
//               onChange={handleInputChange}
//               className={styles.inputField}
//               min="0"
//             />
            
//             <div className={styles.fileUpload}>
//               <input
//                 type="file"
//                 onChange={handleImageChange}
//                 className={styles.fileInput}
//                 accept="image/*"
//                 id="part-image"
//               />
//               <label htmlFor="part-image" className={styles.fileLabel}>
//                 {image ? image.name : 'Choose Image'}
//               </label>
//               <button 
//                 onClick={handleUploadImage} 
//                 className={styles.uploadButton}
//                 disabled={!image}
//               >
//                 Upload
//               </button>
//             </div>
//           </div>

//           <div className={styles.formRow}>
//             <label className={styles.checkboxContainer}>
//               <input
//                 name="criticalLevel"
//                 type="checkbox"
//                 checked={formData.criticalLevel}
//                 onChange={handleInputChange}
//               />
//               <span className={styles.checkboxLabel}>Critical Level</span>
//             </label>

//             <div className={styles.formActions}>
//               {editingId && (
//                 <button 
//                   onClick={resetForm}
//                   className={styles.cancelButton}
//                 >
//                   Cancel
//                 </button>
//               )}
//               <button 
//                 onClick={editingId ? handleUpdate : handleAdd}
//                 className={styles.saveButton}
//                 disabled={!formData.name}
//               >
//                 {editingId ? 'Update Part' : 'Add Part'}
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Table Section */}
//         <div className={styles.tableContainer}>
//           <table {...getTableProps()} className={styles.dataTable}>
//             <thead>
//               {headerGroups.map((headerGroup: HeaderGroup<SparePart>) => {
//                 const { key, ...restHeaderGroupProps } = headerGroup.getHeaderGroupProps();
//                 return (
//                   <tr key={key} {...restHeaderGroupProps}>
//                     {headerGroup.headers.map((column: ColumnInstance<SparePart>) => {
//                       const { key: headerKey, ...restHeaderProps } = column.getHeaderProps(column.getSortByToggleProps());
//                       return (
//                         <th key={headerKey} {...restHeaderProps}>
//                           <div className={styles.headerContent}>
//                             {column.render('Header')}
//                             <span className={styles.sortIndicator}>
//                               {column.isSorted ? (column.isSortedDesc ? ' ↓' : ' ↑') : ''}
//                             </span>
//                           </div>
//                         </th>
//                       );
//                     })}
//                   </tr>
//                 );
//               })}
//               {headerGroups.length > 0 && (
//                 <tr className={styles.filterRow}>
//                   {headerGroups[0].headers.map((column: ColumnInstance<SparePart>) => (
//                     <th key={column.id}>
//                       {column.Filter ? (
//                         <div className={styles.filterWrapper}>
//                           {column.render('Filter')}
//                         </div>
//                       ) : null}
//                     </th>
//                   ))}
//                 </tr>
//               )}
//             </thead>
//             <tbody {...getTableBodyProps()}>
//               {page.length > 0 ? (
//                 page.map((row: Row<SparePart>) => {
//                   prepareRow(row);
//                   const { key, ...restRowProps } = row.getRowProps();
//                   return (
//                     <tr key={key} {...restRowProps}>
                      
//                       {/* {row.cells.map(cell => {
//                         const { key: cellKey, ...restCellProps } = cell.getCellProps();
//                         return (
//                           <td key={cellKey} {...restCellProps}>
//                             {cell.render('Cell')}
//                           </td>
//                         );
//                       })} */}

//                       {row.cells.map((cell: any) => {
//   const { key: cellKey, ...restCellProps } = cell.getCellProps();
//   return (
//     <td key={cellKey} {...restCellProps}>
//       {cell.render('Cell')}
//     </td>
//   );
// })}

//                     </tr>
//                   );
//                 })
//               ) : (
//                 <tr>
//                   <td colSpan={columns.length} className={styles.noData}>
//                     No spare parts found
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>

//           {/* Pagination */}
//           <div className={styles.pagination}>
//             <button 
//               onClick={() => gotoPage(0)} 
//               disabled={!canPreviousPage}
//               className={styles.pageButton}
//             >
//               «
//             </button>
//             <button 
//               onClick={previousPage} 
//               disabled={!canPreviousPage}
//               className={styles.pageButton}
//             >
//               ‹
//             </button>
//             <span className={styles.pageInfo}>
//               Page <strong>{pageIndex + 1}</strong> of <strong>{pageOptions.length}</strong>
//             </span>
//             <button 
//               onClick={nextPage} 
//               disabled={!canNextPage}
//               className={styles.pageButton}
//             >
//               ›
//             </button>
//             <button 
//               onClick={() => gotoPage(pageCount - 1)} 
//               disabled={!canNextPage}
//               className={styles.pageButton}
//             >
//               »
//             </button>
//           </div>
//         </div>

//         {/* Modal for Full-Size Image */}
//         {showModal && (
//           <div
//             className={styles.imageModal}
//             onClick={() => setShowModal(false)}
//           >
//             <div className={styles.modalContent}>
//               <img
//                 src={selectedImage || ''}
//                 alt="Full-size spare part"
//                 className={styles.fullImage}
//               />
//               <button
//                 onClick={() => setShowModal(false)}
//                 className={styles.closeButton}
//               >
//                 ×
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Delete Confirmation Dialog */}
//         <ConfirmationDialog
//           isOpen={showDeleteDialog}
//           onConfirm={handleDelete}
//           onCancel={closeDeleteDialog}
//           title="Confirm Deletion"
//           message="Are you sure you want to delete this spare part?"
//         />

//         {/* Toast Notification */}
//         {toast && <Toast message={toast.message} type={toast.type} />}
//       </div>
//     </ErrorBoundary>
//   );
// };

// // Filter Components
// // const DefaultColumnFilter: React.FC<{
// //   column: {
// //     filterValue: string | undefined;
// //     setFilter: (value: string | undefined) => void;
// //     id: string;
// //   };
// // }> = ({ column }) => {
// //   return (
// //     <input
// //       value={column.filterValue || ''}
// //       onChange={e => column.setFilter(e.target.value || undefined)}
// //       placeholder={`Search...`}
// //       className={styles.filterInput}
// //     />
// //   );
// // };

// const DefaultColumnFilter: React.FC<{
//   column: {
//     filterValue?: string;
//     setFilter: (value: string | undefined) => void;
//     id: string;
//   };
// }> = ({ column }) => {
//   return (
//     <input
//       value={column.filterValue || ''}
//       onChange={e => column.setFilter(e.target.value || undefined)}
//       placeholder="Search..."
//       className={styles.filterInput}
//     />
//   );
// };


// const NumberRangeColumnFilter: React.FC<{
//   column: {
//     filterValue: [number | undefined, number | undefined] | undefined;
//     setFilter: (value: [number | undefined, number | undefined] | undefined) => void;
//     preFilteredRows: Row<SparePart>[];
//     id: string;
//   };
// }> = ({ column }) => {
//   const [min, max] = useMemo(() => {
//     let minVal = Infinity;
//     let maxVal = -Infinity;
//     column.preFilteredRows.forEach(row => {
//       const value = row.values[column.id];
//       if (typeof value === 'number') {
//         minVal = Math.min(minVal, value);
//         maxVal = Math.max(maxVal, value);
//       }
//     });
//     return [minVal === Infinity ? 0 : minVal, maxVal === -Infinity ? 0 : -1];
//   }, [column.id, column.preFilteredRows]);

//   const [minInput, maxInput] = column.filterValue || [undefined, undefined];

//   return (
//     <div className={styles.rangeFilter}>
//       <input
//         value={minInput ?? ''}
//         type="number"
//         onChange={e => {
//           const val = e.target.value ? parseFloat(e.target.value) : undefined;
//           column.setFilter([val, maxInput]);
//         }}
//         placeholder={`Min (${min})`}
//         className={styles.rangeInput}
//       />
//       <span className={styles.rangeSeparator}>to</span>
//       <input
//         value={maxInput ?? ''}
//         type="number"
//         onChange={e => {
//           const val = e.target.value ? parseFloat(e.target.value) : undefined;
//           column.setFilter([minInput, val]);
//         }}
//         placeholder={`Max (${max})`}
//         className={styles.rangeInput}
//       />
//     </div>
//   );
// };

// const SelectColumnFilter: React.FC<{
//   column: {
//     value: string | undefined;
//     setFilter: (value: string | undefined) => void;
//     preFilteredRows: Row<SparePart>[];
//     id: string;
//   };
// }> = ({ column }) => {
//   const options = useMemo(() => {
//     const values = new Set<string>();
//     column.preFilteredRows.forEach(row => {
//       values.add(String(row.values[column.id]));
//     });
//     return Array.from(values);
//   }, [column.id, column.preFilteredRows]);

//   return (
//     <select
//       value={column.filterValue || ''}
//       onChange={e => column.setFilter(e.target.value || undefined)}
//       className={styles.selectFilter}
//     >
//       <option value="">All</option>
//       {options.map(option => (
//         <option key={option} value={option}>
//           {option}
//         </option>
//       ))}
//     </select>
//   );
// };

// const Toast = ({ message, type }: { message: string; type: 'success' | 'error' }) => {
//   const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
//   return (
//     <div className={`fixed top-4 right-4 ${bgColor} text-white px-4 py-2 rounded shadow-lg z-50 animate-fade-in-out`}>
//       {message}
//     </div>
//   );
// };

// export default SparePartsTab;


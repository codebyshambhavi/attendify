import { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { adminAPI } from '../../services/api';
import { downloadBlob } from '../../utils/helpers';
import { Button } from '../ui';

export default function ExportButtons({ month, className = '' }) {
  const [csvLoading, setCsvLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleCSV = async () => {
    setCsvLoading(true);
    try {
      const { data } = await adminAPI.exportCSV(month);
      downloadBlob(data, `attendance-${month || 'all'}.csv`);
      toast.success('CSV downloaded!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Export failed');
    } finally {
      setCsvLoading(false);
    }
  };

  const handlePDF = async () => {
    setPdfLoading(true);
    try {
      const { data } = await api.get('/admin/export/pdf', {
        params: { month },
        responseType: 'blob',
      });
      downloadBlob(data, `attendance-${month || 'all'}.pdf`);
      toast.success('PDF downloaded!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'PDF export failed');
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <Button variant="secondary" size="sm" onClick={handleCSV} loading={csvLoading}>
        <Download size={14} /> CSV
      </Button>
      <Button variant="secondary" size="sm" onClick={handlePDF} loading={pdfLoading}>
        <FileText size={14} /> PDF
      </Button>
    </div>
  );
}

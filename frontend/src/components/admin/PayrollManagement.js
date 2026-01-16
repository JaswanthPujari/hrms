import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DollarSign, FileText } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../lib/api';

export default function PayrollManagement() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payrollDialog, setPayrollDialog] = useState(false);
  const [payslipDialog, setPayslipDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [payrollForm, setPayrollForm] = useState({
    employee_id: '',
    basic_salary: '',
    allowances: '',
    deductions: '',
  });
  const [payslipForm, setPayslipForm] = useState({
    employee_id: '',
    month: '',
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data);
    } catch (error) {
      toast.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignPayroll = async (e) => {
    e.preventDefault();\n    try {
      await api.post('/payroll', {
        ...payrollForm,
        basic_salary: parseFloat(payrollForm.basic_salary),
        allowances: parseFloat(payrollForm.allowances) || 0,
        deductions: parseFloat(payrollForm.deductions) || 0,
      });
      toast.success('Payroll assigned successfully!');
      setPayrollForm({ employee_id: '', basic_salary: '', allowances: '', deductions: '' });
      setPayrollDialog(false);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to assign payroll');
    }
  };

  const handleGeneratePayslip = async (e) => {
    e.preventDefault();
    try {
      await api.post('/payslips/generate', payslipForm);
      toast.success('Payslip generated successfully!');
      setPayslipForm({ employee_id: '', month: '' });
      setPayslipDialog(false);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to generate payslip');
    }
  };

  if (loading) {
    return <div className="text-zinc-600">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-zinc-900">Payroll Management</h2>
        <p className="text-sm text-zinc-600 mt-1">Assign salaries and generate payslips</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Assign Payroll Card */}
        <Card className="border-zinc-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-zinc-900">
              <DollarSign className="h-5 w-5" />
              Assign Payroll
            </CardTitle>
            <CardDescription>Set salary details for employees</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={payrollDialog} onOpenChange={setPayrollDialog}>
              <DialogTrigger asChild>
                <Button className="w-full bg-zinc-900 hover:bg-zinc-800" data-testid="assign-payroll-button">
                  Assign Payroll
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign Payroll</DialogTitle>
                  <DialogDescription>
                    Set salary components for an employee
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAssignPayroll} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Employee</Label>
                    <Select
                      value={payrollForm.employee_id}
                      onValueChange={(value) =>
                        setPayrollForm({ ...payrollForm, employee_id: value })
                      }
                      required
                    >
                      <SelectTrigger data-testid="payroll-employee-select">
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.name} - {emp.department}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="basic_salary">Basic Salary</Label>
                    <Input
                      id="basic_salary"
                      data-testid="basic-salary-input"
                      type="number"
                      step="0.01"
                      placeholder="5000"
                      value={payrollForm.basic_salary}
                      onChange={(e) =>
                        setPayrollForm({ ...payrollForm, basic_salary: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="allowances">Allowances</Label>
                    <Input
                      id="allowances"
                      data-testid="allowances-input"
                      type="number"
                      step="0.01"
                      placeholder="500"
                      value={payrollForm.allowances}
                      onChange={(e) =>
                        setPayrollForm({ ...payrollForm, allowances: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deductions">Deductions</Label>
                    <Input
                      id="deductions"
                      data-testid="deductions-input"
                      type="number"
                      step="0.01"
                      placeholder="200"
                      value={payrollForm.deductions}
                      onChange={(e) =>
                        setPayrollForm({ ...payrollForm, deductions: e.target.value })
                      }
                    />
                  </div>
                  <Button type="submit" className="w-full bg-zinc-900 hover:bg-zinc-800" data-testid="submit-payroll-button">
                    Assign Payroll
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Generate Payslip Card */}
        <Card className="border-zinc-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-zinc-900">
              <FileText className="h-5 w-5" />
              Generate Payslip
            </CardTitle>
            <CardDescription>Create monthly payslips for employees</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={payslipDialog} onOpenChange={setPayslipDialog}>
              <DialogTrigger asChild>
                <Button className="w-full bg-zinc-900 hover:bg-zinc-800" data-testid="generate-payslip-button">
                  Generate Payslip
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate Payslip</DialogTitle>
                  <DialogDescription>
                    Create a payslip for a specific month
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleGeneratePayslip} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Employee</Label>
                    <Select
                      value={payslipForm.employee_id}
                      onValueChange={(value) =>
                        setPayslipForm({ ...payslipForm, employee_id: value })
                      }
                      required
                    >
                      <SelectTrigger data-testid="payslip-employee-select">
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.name} - {emp.department}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="month">Month</Label>
                    <Input
                      id="month"
                      data-testid="payslip-month-input"
                      type="month"
                      value={payslipForm.month}
                      onChange={(e) =>
                        setPayslipForm({ ...payslipForm, month: e.target.value })
                      }
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-zinc-900 hover:bg-zinc-800" data-testid="submit-payslip-button">
                    Generate Payslip
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// @ts-nocheck
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Plus, Package, DollarSign, Hash, AlertTriangle, FileSpreadsheet, Upload, Minus } from 'lucide-react'
import { z } from 'zod'

const inventorySchema = z.object({
  product_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  sku: z.string().max(50).optional(),
  category: z.string().max(50).optional(),
  quantity: z.number().int().min(0, 'La cantidad debe ser 0 o mayor'),
  unit_price: z.number().positive('El precio debe ser positivo').optional(),
  min_stock: z.number().int().min(0, 'El stock mínimo debe ser 0 o mayor').optional(),
})

interface InventoryItem {
  id: string
  product_name: string
  sku: string | null
  category: string | null
  quantity: number
  unit_price: number | null
  min_stock: number
}

interface InventoryListProps {
  branchId: string
  userRole?: string
}

const InventoryList = ({ branchId, userRole = 'admin' }: InventoryListProps) => {
  const canEdit = userRole === 'admin' || userRole === 'gerente'
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([])
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [importing, setImporting] = useState(false)
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [adjustAmount, setAdjustAmount] = useState('')
  const [formData, setFormData] = useState({
    product_name: '',
    sku: '',
    category: '',
    quantity: '0',
    unit_price: '',
    min_stock: '0',
  })

  useEffect(() => {
    fetchInventory()
  }, [branchId])

  useEffect(() => {
    let filtered = inventory

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtrar por categoría
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter)
    }

    setFilteredInventory(filtered)
  }, [inventory, searchTerm, categoryFilter])

  const fetchInventory = async () => {
    try {
      // @ts-expect-error - Supabase types need to be regenerated
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('branch_id', branchId)
        .order('product_name')

      if (error) throw error
      setInventory(data || [])
      setFilteredInventory(data || [])
    } catch (error) {
      console.error('Error fetching inventory:', error)
      toast({
        title: 'Error',
        description: 'No se pudo cargar el inventario',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      product_name: formData.product_name,
      sku: formData.sku || null,
      category: formData.category || null,
      quantity: parseInt(formData.quantity),
      unit_price: formData.unit_price ? parseFloat(formData.unit_price) : null,
      min_stock: parseInt(formData.min_stock) || 0,
    }

    try {
      inventorySchema.parse(payload)
    } catch (error: any) {
      if (error?.errors) {
        toast({
          title: 'Error de validación',
          description: error.errors[0]?.message || 'Error de validación',
          variant: 'destructive',
        })
        return
      }
    }

    setSaving(true)
    try {
      // @ts-ignore - Supabase types need to be regenerated
      const { error } = await supabase
        .from('inventory')
        .insert({
          ...payload,
          branch_id: branchId,
        })

      if (error) throw error

      toast({
        title: 'Producto agregado',
        description: 'El producto ha sido agregado al inventario',
      })
      
      setOpen(false)
      setFormData({
        product_name: '',
        sku: '',
        category: '',
        quantity: '0',
        unit_price: '',
        min_stock: '0',
      })
      setShowNewCategoryInput(false)
      setNewCategoryName('')
      fetchInventory()
    } catch (error) {
      console.error('Error adding inventory:', error)
      toast({
        title: 'Error',
        description: 'No se pudo agregar el producto',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const updateQuantity = async (itemId: string, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change
    if (newQuantity < 0) {
      toast({
        title: 'Operación no permitida',
        description: 'La cantidad no puede ser negativa',
        variant: 'destructive',
      })
      return
    }

    try {
      // @ts-ignore
      const { error } = await supabase
        .from('inventory')
        .update({ quantity: newQuantity })
        .eq('id', itemId)

      if (error) throw error

      toast({
        title: 'Cantidad actualizada',
        description: `La cantidad ha sido ${change > 0 ? 'aumentada' : 'disminuida'}`,
      })

      fetchInventory()
    } catch (error) {
      console.error('Error updating quantity:', error)
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la cantidad',
        variant: 'destructive',
      })
    }
  }

  const handleAdjustQuantity = async (isAddition: boolean) => {
    if (!selectedItem || !adjustAmount) return
    
    const amount = parseInt(adjustAmount)
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Cantidad inválida',
        description: 'Ingresa un número válido mayor a 0',
        variant: 'destructive',
      })
      return
    }

    const change = isAddition ? amount : -amount
    const newQuantity = selectedItem.quantity + change

    if (newQuantity < 0) {
      toast({
        title: 'Operación no permitida',
        description: 'La cantidad resultante no puede ser negativa',
        variant: 'destructive',
      })
      return
    }

    try {
      // @ts-ignore
      const { error } = await supabase
        .from('inventory')
        .update({ quantity: newQuantity })
        .eq('id', selectedItem.id)

      if (error) throw error

      toast({
        title: 'Cantidad ajustada',
        description: `${isAddition ? 'Agregadas' : 'Removidas'} ${amount} unidades`,
      })

      setAdjustDialogOpen(false)
      setAdjustAmount('')
      setSelectedItem(null)
      fetchInventory()
    } catch (error) {
      console.error('Error adjusting quantity:', error)
      toast({
        title: 'Error',
        description: 'No se pudo ajustar la cantidad',
        variant: 'destructive',
      })
    }
  }

  const exportToCSV = () => {
    const headers = ['Producto', 'SKU', 'Categoría', 'Cantidad', 'Precio Unitario', 'Stock Mínimo', 'Valor Total']
    const rows = filteredInventory.map(item => [
      item.product_name,
      item.sku || '',
      item.category || '',
      item.quantity,
      item.unit_price || '',
      item.min_stock,
      item.unit_price ? (item.unit_price * item.quantity).toFixed(2) : ''
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `inventario_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: 'Inventario exportado',
      description: 'El archivo CSV ha sido descargado exitosamente',
    })
  }

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    try {
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      
      // Skip header row
      const dataLines = lines.slice(1)
      
      const products = dataLines.map(line => {
        const values = line.split(',').map(v => v.replace(/^"|"$/g, '').trim())
        return {
          product_name: values[0],
          sku: values[1] || null,
          category: values[2] || null,
          quantity: parseInt(values[3]) || 0,
          unit_price: values[4] ? parseFloat(values[4]) : null,
          min_stock: parseInt(values[5]) || 0,
          branch_id: branchId,
        }
      }).filter(p => p.product_name)

      if (products.length === 0) {
        toast({
          title: 'Error',
          description: 'No se encontraron productos válidos en el archivo',
          variant: 'destructive',
        })
        return
      }

      // @ts-ignore
      const { error } = await supabase
        .from('inventory')
        .insert(products)

      if (error) throw error

      toast({
        title: 'Importación exitosa',
        description: `Se importaron ${products.length} productos`,
      })

      fetchInventory()
    } catch (error) {
      console.error('Error importing CSV:', error)
      toast({
        title: 'Error',
        description: 'No se pudo importar el archivo. Verifica el formato.',
        variant: 'destructive',
      })
    } finally {
      setImporting(false)
      e.target.value = ''
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const totalValue = inventory.reduce((sum, item) => 
    sum + (item.unit_price || 0) * item.quantity, 0
  )

  const lowStockItems = inventory.filter(item => item.quantity <= item.min_stock)
  
  const categories = ['all', ...new Set(inventory.map(item => item.category).filter(Boolean))]
  const existingCategories = [...new Set(inventory.map(item => item.category).filter(Boolean))] as string[]

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Inventario ({inventory.length} productos)</h2>
          <p className="text-muted-foreground">Valor total: ${totalValue.toLocaleString()}</p>
          {lowStockItems.length > 0 && (
            <p className="text-orange-600 flex items-center gap-1 text-sm mt-1">
              <AlertTriangle className="h-4 w-4" />
              {lowStockItems.length} productos con stock bajo
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={exportToCSV}
            disabled={filteredInventory.length === 0}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          {canEdit && (
            <>
              <Button
                variant="outline"
                disabled={importing}
                onClick={() => document.getElementById('csv-upload')?.click()}
              >
                {importing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Importar
              </Button>
              <input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
                className="hidden"
              />
            </>
          )}
          {canEdit && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-primary text-secondary hover:shadow-hive">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Producto
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Producto</DialogTitle>
              <DialogDescription>
                Completa la información del producto a agregar al inventario
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product_name">Nombre del Producto *</Label>
                  <div className="relative">
                    <Package className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="product_name"
                      value={formData.product_name}
                      onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  {!showNewCategoryInput ? (
                    <div className="space-y-2">
                      <select
                        id="category"
                        value={formData.category}
                        onChange={(e) => {
                          if (e.target.value === '__new__') {
                            setShowNewCategoryInput(true)
                            setFormData({ ...formData, category: '' })
                          } else {
                            setFormData({ ...formData, category: e.target.value })
                          }
                        }}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="">Seleccionar categoría</option>
                        {existingCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                        <option value="__new__" className="font-semibold text-primary">+ Agregar nueva categoría</option>
                      </select>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Input
                        id="new-category"
                        placeholder="Nombre de la nueva categoría"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            if (newCategoryName.trim()) {
                              setFormData({ ...formData, category: newCategoryName.trim() })
                              setNewCategoryName('')
                              setShowNewCategoryInput(false)
                              toast({
                                title: 'Categoría agregada',
                                description: 'La nueva categoría se guardará con el producto',
                              })
                            }
                          }}
                        >
                          Agregar
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setShowNewCategoryInput(false)
                            setNewCategoryName('')
                          }}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Cantidad *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit_price">Precio Unitario ($)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="unit_price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.unit_price}
                      onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min_stock">Stock Mínimo</Label>
                  <Input
                    id="min_stock"
                    type="number"
                    min="0"
                    value={formData.min_stock}
                    onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-gradient-primary text-secondary"
                  disabled={saving}
                >
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar
                </Button>
              </div>
            </form>
            </DialogContent>
          </Dialog>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-card border border-border rounded-lg">
        <div className="space-y-2">
          <Label htmlFor="search">Buscar producto</Label>
          <Input
            id="search"
            placeholder="Buscar por nombre o SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Categoría</Label>
          <select
            id="category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">Todas las categorías</option>
            {categories.filter(cat => cat !== 'all').map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {inventory.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No hay productos en el inventario de esta sucursal</p>
        </Card>
      ) : filteredInventory.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No se encontraron productos que coincidan con los filtros</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredInventory.map((item) => (
            <Card key={item.id} className="p-6 hover:shadow-hive transition-shadow">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{item.product_name}</h3>
                    {item.quantity <= item.min_stock && (
                      <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-700 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Stock Bajo
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {item.sku && <span>SKU: {item.sku}</span>}
                    {item.category && <span>Categoría: {item.category}</span>}
                  </div>
                </div>
                <div className="text-right space-y-2">
                  {canEdit ? (
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity, -1)}
                        disabled={item.quantity === 0}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <div 
                        className="text-2xl font-bold text-foreground min-w-[60px] cursor-pointer hover:text-primary transition-colors"
                        onClick={() => {
                          setSelectedItem(item)
                          setAdjustDialogOpen(true)
                        }}
                        title="Click para ajustar cantidad"
                      >
                        {item.quantity}
                      </div>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity, 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-foreground">
                      Cantidad: {item.quantity}
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground">unidades</div>
                  {item.unit_price && (
                    <div className="text-sm text-muted-foreground">
                      ${item.unit_price.toLocaleString()} c/u
                    </div>
                  )}
                  {item.unit_price && (
                    <div className="text-sm font-semibold text-primary">
                      Total: ${(item.unit_price * item.quantity).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
        
      {/* Diálogo para ajustar cantidades grandes */}
      <Dialog open={adjustDialogOpen} onOpenChange={setAdjustDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajustar Cantidad</DialogTitle>
            <DialogDescription>
              {selectedItem?.product_name} - Stock actual: {selectedItem?.quantity} unidades
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adjust-amount">Cantidad a ajustar</Label>
              <Input
                id="adjust-amount"
                type="number"
                min="1"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
                placeholder="Ingresa la cantidad"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => setAdjustAmount('10')}
              >
                10
              </Button>
              <Button
                variant="outline"
                onClick={() => setAdjustAmount('50')}
              >
                50
              </Button>
              <Button
                variant="outline"
                onClick={() => setAdjustAmount('100')}
              >
                100
              </Button>
              <Button
                variant="outline"
                onClick={() => setAdjustAmount('500')}
              >
                500
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                onClick={() => handleAdjustQuantity(true)}
                disabled={!adjustAmount}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={() => handleAdjustQuantity(false)}
                disabled={!adjustAmount || (selectedItem && parseInt(adjustAmount) > selectedItem.quantity)}
              >
                <Minus className="h-4 w-4 mr-2" />
                Remover
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default InventoryList

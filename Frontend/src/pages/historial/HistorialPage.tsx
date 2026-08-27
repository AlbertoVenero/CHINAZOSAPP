// src/pages/historial/HistorialPage.tsx
import { useState } from 'react';
import { 
  Card, 
  CardBody, 
  Select, 
  SelectItem, 
  Button,
  Input,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Avatar,
  Alert,
  Modal,
  ModalContent
} from '@nextui-org/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useHistorialPage } from './useHistorialPage';

export const HistorialPage = () => {
  const {
    tipoFiltro,
    setTipoFiltro,
    mesSeleccionado,
    setMesSeleccionado,
    añoSeleccionado,
    setAñoSeleccionado,
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    filtroSicario,
    setFiltroSicario,
    resultados,
    haBuscado,
    loading,
    error,
    sicarios,
    loadingSicarios,
    handleBuscar,
    handleLimpiar,
    getNombreMes,
    formatearFecha,
    getImageUrl,
    añosDisponibles,
    mesesDisponibles
  } = useHistorialPage();

  // Estado para el modal de foto
  const [modalFotoAbierto, setModalFotoAbierto] = useState(false);
  const [fotoParaModal, setFotoParaModal] = useState<string>('');
  const [aliasParaModal, setAliasParaModal] = useState<string>('');

  // Funciones para el modal de foto
  const abrirModalFoto = (foto: string | null, alias: string) => {
    const urlFoto = getImageUrl(foto) || '';
    setFotoParaModal(urlFoto);
    setAliasParaModal(alias);
    setModalFotoAbierto(true);
  };

  const cerrarModalFoto = () => {
    setModalFotoAbierto(false);
    setFotoParaModal('');
    setAliasParaModal('');
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      {/* Modal para ver foto grande */}
      <Modal 
        isOpen={modalFotoAbierto} 
        onClose={cerrarModalFoto}
        size="full"
        placement="center"
        className="bg-transparent"
        hideCloseButton={true}
        classNames={{
          backdrop: "bg-black/80",
        }}
      >
        <ModalContent className="bg-black/90 backdrop-blur-sm">
          {() => (
            <div className="relative flex flex-col items-center justify-center min-h-[80vh] p-8">
              <Button
                isIconOnly
                variant="light"
                className="absolute top-4 right-4 text-white hover:bg-white/20 z-50"
                onPress={cerrarModalFoto}
              >
                <XMarkIcon className="h-8 w-8" />
              </Button>
              
              {fotoParaModal ? (
                <img
                  src={fotoParaModal}
                  alt={aliasParaModal}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '';
                  }}
                />
              ) : (
                <div className="text-white text-center">
                  <p className="text-4xl mb-4">📷</p>
                  <p className="text-xl">No hay foto disponible</p>
                </div>
              )}
              
              <div className="mt-6 text-center">
                <span className="text-2xl font-bold text-white bg-black/60 px-6 py-2 rounded-full backdrop-blur-sm">
                  @{aliasParaModal}
                </span>
              </div>
            </div>
          )}
        </ModalContent>
      </Modal>

      {/* Card de filtros */}
      <Card>
        <CardBody className="gap-4">
          <h1 className="text-xl font-bold text-center mb-2">Historial de Chinazos</h1>
          
          {error && (
            <Alert
              color="danger"
              title="Error"
              description={error}
              onClose={() => {}}
            />
          )}
          
          <Select
            label="Tipo de filtro"
            placeholder="Selecciona un tipo de filtro"
            selectedKeys={tipoFiltro ? [tipoFiltro] : []}
            onChange={(e) => setTipoFiltro(e.target.value as any)}
            isDisabled={loading}
          >
            <SelectItem key="mes" value="mes">Por mes</SelectItem>
            <SelectItem key="personalizado" value="personalizado">Personalizado (rango de fechas)</SelectItem>
            <SelectItem key="sicario" value="sicario">Por sicario</SelectItem>
          </Select>

          {tipoFiltro === 'mes' && (
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Mes"
                placeholder="Selecciona un mes"
                selectedKeys={mesSeleccionado ? [mesSeleccionado] : []}
                onChange={(e) => setMesSeleccionado(e.target.value)}
                isDisabled={loading}
              >
                {mesesDisponibles.map((mes) => (
                  <SelectItem key={mes.key} value={mes.key}>
                    {mes.label}
                  </SelectItem>
                ))}
              </Select>
              <Select
                label="Año"
                placeholder="Selecciona un año"
                selectedKeys={añoSeleccionado ? [añoSeleccionado] : []}
                onChange={(e) => setAñoSeleccionado(e.target.value)}
                isDisabled={loading}
              >
                {añosDisponibles.map((año) => (
                  <SelectItem key={año.key} value={año.key}>
                    {año.label}
                  </SelectItem>
                ))}
              </Select>
            </div>
          )}

          {tipoFiltro === 'personalizado' && (
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                label="Fecha inicio"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                isDisabled={loading}
              />
              <Input
                type="date"
                label="Fecha fin"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                isDisabled={loading}
              />
            </div>
          )}

          {tipoFiltro === 'sicario' && (
            <Select
              label="Selecciona el sicario"
              placeholder="Elige un sicario"
              selectedKeys={filtroSicario ? [filtroSicario] : []}
              onChange={(e) => {
                console.log('📅 [Historial] Select sicario - Valor seleccionado:', e.target.value);
                setFiltroSicario(e.target.value);
              }}
              isLoading={loadingSicarios}
              isDisabled={loading || loadingSicarios}
              isRequired
            >
              {sicarios.map((sicario) => (
                <SelectItem key={String(sicario.id)} value={String(sicario.id)}>
                  <div className="flex items-center gap-2">
                    <Avatar 
                      src={getImageUrl(sicario.foto)}
                      name={sicario.alias}
                      size="sm"
                      className="w-6 h-6"
                    />
                    <div>
                      <span className="font-medium">{sicario.alias}</span>
                      <span className="text-xs text-default-400 ml-2">({sicario.nombre})</span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </Select>
          )}

          <div className="flex gap-2">
            <Button 
              color="primary" 
              onPress={handleBuscar}
              className="flex-1"
              isLoading={loading}
              isDisabled={loading}
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </Button>
            <Button 
              variant="light" 
              onPress={handleLimpiar}
              className="flex-1"
              isDisabled={loading}
            >
              Limpiar
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Card de resultados - Solo se muestra si hay resultados */}
      {haBuscado && !loading && resultados.length > 0 && (
        <>
          {/* Card 1: Encabezado con contador y filtro aplicado */}
          <Card>
            <CardBody className="flex flex-row justify-between items-center">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold">
                  Resultados encontrados: 
                  <span className="text-primary ml-2">{resultados.length}</span>
                </h2>
                {tipoFiltro === 'mes' && mesSeleccionado && añoSeleccionado && (
                  <Chip color="primary" size="sm" variant="flat">
                    {getNombreMes(mesSeleccionado)} {añoSeleccionado}
                  </Chip>
                )}
                {tipoFiltro === 'sicario' && filtroSicario && (
                  <Chip color="secondary" size="sm" variant="flat">
                    {sicarios.find(s => String(s.id) === filtroSicario)?.alias || 'Sicario'}
                  </Chip>
                )}
                {tipoFiltro === 'personalizado' && fechaInicio && fechaFin && (
                  <Chip color="warning" size="sm" variant="flat">
                    {formatearFecha(fechaInicio)} - {formatearFecha(fechaFin)}
                  </Chip>
                )}
              </div>
              <Button
                size="sm"
                variant="light"
                onPress={handleLimpiar}
                isDisabled={loading}
              >
                Limpiar resultados
              </Button>
            </CardBody>
          </Card>

          {/* Card 2: Tabla con los resultados */}
          <Card>
            
              <Table aria-label="Tabla de chinazos">
                <TableHeader>
                  <TableColumn>#</TableColumn>
                  <TableColumn>Quién lo dijo</TableColumn>
                  <TableColumn>Chinazo</TableColumn>
                  <TableColumn>Fecha</TableColumn>
                  <TableColumn>Anotado por</TableColumn>
                  <TableColumn>Votos</TableColumn>
                </TableHeader>
                <TableBody>
                  {resultados.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div 
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => abrirModalFoto(item.quien_dijo_foto, item.quien_dijo_alias)}
                          >
                            <Avatar 
                              src={getImageUrl(item.quien_dijo_foto)}
                              name={item.quien_dijo_alias || '?'}
                              size="sm"
                              className="w-8 h-8"
                            />
                          </div>
                          <Chip color="primary" size="sm">
                            {item.quien_dijo_alias || 'Desconocido'}
                          </Chip>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="truncate">{item.chinazo}</p>
                      </TableCell>
                      <TableCell>{formatearFecha(item.fecha)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {item.anotado_por_alias || 'Desconocido'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip color={item.total_votos && item.total_votos > 0 ? 'success' : 'default'} size="sm">
                          {item.total_votos || 0}
                        </Chip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            
          </Card>
        </>
      )}

      {/* Mensaje cuando no hay resultados */}
      {haBuscado && !loading && resultados.length === 0 && (
        <Card>
          <CardBody>
            <div className="text-center py-8 text-default-500">
              <p className="text-4xl mb-4">🔍</p>
              <p className="text-lg">No se encontraron chinazos con los filtros seleccionados</p>
              <p className="text-sm mt-2">Prueba con otros filtros o fechas diferentes</p>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};
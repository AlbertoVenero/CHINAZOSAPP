// src/pages/votacion/VotacionPage.tsx
import {
  Card,
  CardBody,
  Select,
  SelectItem,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Badge,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Avatar,
  Alert
} from '@nextui-org/react';
import { XMarkIcon, CheckCircleIcon, EyeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { useVotacionPage } from './useVotacionPage';

export const VotacionPage = () => {
  // console.log('🔄 [VotacionPage] Renderizando componente');

  const {
    chinazos,
    loading,
    error,
    mensaje,
    mesSeleccionado,
    mesesDisponibles,
    chinazoSeleccionado,
    modalConfirmacionAbierto,
    modalDetalleAbierto,
    modalFotoAbierto,
    enviandoVoto,
    handleCambiarMes,
    abrirModalConfirmacion,
    cerrarModalConfirmacion,
    abrirModalDetalle,
    cerrarModalDetalle,
    abrirModalFoto,
    cerrarModalFoto,
    confirmarVoto,
    getImageUrl,
    formatearFecha,
    obtenerMeses
  } = useVotacionPage();

  // Obtener mes actual
  const { mesActual } = obtenerMeses();
  const esMesActual = mesSeleccionado === mesActual;

  // console.log(`📊 [VotacionPage] mesActual: ${mesActual}, mesSeleccionado: ${mesSeleccionado}, esMesActual: ${esMesActual}`);
  // console.log(`📊 [VotacionPage] chinazos: ${chinazos.length}, loading: ${loading}`);

  // Ordenar por votos (más votados primero)
  const chinazosOrdenados = [...chinazos].sort((a, b) => (b.total_votos || 0) - (a.total_votos || 0));

  // console.log(`📊 [VotacionPage] chinazosOrdenados: ${chinazosOrdenados.length}`);

  // ✅ Función para convertir fecha de YYYY/MM/DD a YYYY-MM
  const convertirFechaAMes = (fecha: string): string => {
    if (!fecha) return '';
    // "2026/08/25" → "2026-08"
    return fecha.substring(0, 7).replace('/', '-');
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

              {chinazoSeleccionado?.quien_dijo_foto ? (
                <img
                  src={getImageUrl(chinazoSeleccionado.quien_dijo_foto)}
                  alt={chinazoSeleccionado.quien_dijo_alias || 'Sicario'}
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
                  @{chinazoSeleccionado?.quien_dijo_alias || 'Desconocido'}
                </span>
              </div>
            </div>
          )}
        </ModalContent>
      </Modal>

      {/* Card de filtros */}
      <Card>
        <CardBody className="gap-4">
          <h1 className="text-xl font-bold text-center mb-2">🗳️ Votación de Chinazos</h1>
          <p className="text-center text-sm text-default-500">
            {esMesActual ? '✅ Vota por los chinazos del mes actual' : 'ℹ️ Visualizando chinazos de meses anteriores (no se pueden votar)'}
          </p>

          {error && (
            <Alert
              color={error.includes('No hay chinazos') ? 'warning' : 'danger'}
              title={error}
              onClose={() => {
                // console.log('🧹 [UI] Cerrando alerta de error');
              }}
            />
          )}

          {mensaje && (
            <Alert
              color={mensaje.tipo === 'success' ? 'success' : 'warning'}
              title={mensaje.texto}
              onClose={() => {
                // console.log('🧹 [UI] Cerrando alerta de mensaje');
              }}
            />
          )}

          <Select
            label="Selecciona el mes"
            placeholder="Elige un mes"
            selectedKeys={mesSeleccionado ? [mesSeleccionado] : []}
            onChange={(e) => {
              // console.log(`📅 [UI] Select mes - Valor seleccionado: ${e.target.value}`);
              handleCambiarMes(e.target.value);
            }}
            isLoading={loading}
            fullWidth
            isDisabled={loading}
          >
            {mesesDisponibles.map((mes) => (
              <SelectItem key={mes.key} value={mes.key} textValue={mes.label}>
                {mes.label}
              </SelectItem>
            ))}
          </Select>
        </CardBody>
      </Card>

      {/* Card de resultados */}
      {!loading && chinazosOrdenados.length > 0 && (
        <>
          <Card>
            <CardBody>
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">
                  Chinazos encontrados:
                  <span className="text-primary ml-2">{chinazosOrdenados.length}</span>
                </h2>
                {!esMesActual && (
                  <Chip color="warning" startContent={<LockClosedIcon className="h-3 w-3" />}>
                    Solo lectura
                  </Chip>
                )}
              </div>
            </CardBody>
          </Card>

          <Card>
            <Table aria-label="Tabla de chinazos para votación">
              <TableHeader>
                <TableColumn>Foto</TableColumn>
                <TableColumn>Chinazo</TableColumn>
                <TableColumn>Quién lo dijo</TableColumn>
                <TableColumn>Fecha</TableColumn>
                <TableColumn>Votos</TableColumn>
                <TableColumn>Acciones</TableColumn>
              </TableHeader>
              <TableBody>
                {chinazosOrdenados.map((item) => {
                  const totalVotos = item.total_votos || 0;
                  // ✅ CORREGIDO: Convertir fecha para comparar correctamente
                  const mesChinazo = convertirFechaAMes(item.fecha);
                  const esChinazoActual = mesChinazo === mesActual;

                  /*
                  console.log(`🔍 [UI] Renderizando chinazo ${index + 1}/${chinazosOrdenados.length}:`, {
                    id: item.id,
                    chinazo: item.chinazo,
                    fechaOriginal: item.fecha,
                    mesChinazo,
                    mesActual,
                    yaVoto: item.yaVoto,
                    totalVotos,
                    esChinazoActual
                  });
                  */

                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => {
                            // console.log(`🖼️ [UI] Click en foto para chinazo ID: ${item.id}`);
                            abrirModalFoto(item);
                          }}
                        >
                          <Avatar
                            src={getImageUrl(item.quien_dijo_foto)}
                            name={item.quien_dijo_alias || '?'}
                            size="sm"
                            className="w-10 h-10"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate">
                          {item.chinazo}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip color="primary" size="sm">
                          {item.quien_dijo_alias || 'Desconocido'}
                        </Chip>
                      </TableCell>
                      <TableCell>{formatearFecha(item.fecha)}</TableCell>
                      <TableCell>
                        <Badge color="secondary" content={totalVotos}>
                          <span className="text-sm">Votos</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          color="primary"
                          onPress={() => {
                            // console.log(`🔘 [UI] Click en "Ver" para chinazo ID: ${item.id}`);
                            // console.log(`🔘 [UI] yaVoto: ${item.yaVoto}, esChinazoActual: ${esChinazoActual}`);
                            abrirModalDetalle(item);
                          }}
                          startContent={<EyeIcon className="h-4 w-4" />}
                          isDisabled={!esChinazoActual}
                        >
                          Ver
                        </Button>
                        {!esChinazoActual && (
                          <span className="text-xs text-default-400 ml-1">
                            🔒
                          </span>
                        )}
                        {item.yaVoto && esChinazoActual && (
                          <span className="text-xs text-success ml-1">
                            ✅
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </>
      )}

      {/* Mensaje cuando no hay resultados */}
      {!loading && chinazosOrdenados.length === 0 && (
        <Card>
          <CardBody>
            <div className="text-center py-8 text-default-500">
              <p className="text-4xl mb-4">📭</p>
              <p className="text-lg">No hay chinazos en este mes</p>
              {esMesActual ? (
                <p className="text-sm mt-2">Aún no se han registrado chinazos para el mes actual</p>
              ) : (
                <p className="text-sm mt-2">Selecciona el mes actual para ver los chinazos disponibles para votar</p>
              )}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Modal de detalle del chinazo */}
      <Modal isOpen={modalDetalleAbierto} onClose={() => {
        // console.log('🔒 [UI] Cerrando modal de detalle');
        cerrarModalDetalle();
      }} size="2xl">
        <ModalContent>
          <ModalHeader>Detalle del Chinazo</ModalHeader>
          <ModalBody>
            <div className="flex flex-col items-center gap-4">
              <div
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => {
                  // console.log(`🖼️ [UI] Click en foto en modal de detalle para chinazo ID: ${chinazoSeleccionado?.id}`);
                  if (chinazoSeleccionado) {
                    cerrarModalDetalle();
                    setTimeout(() => abrirModalFoto(chinazoSeleccionado), 100);
                  }
                }}
              >
                <Avatar
                  src={getImageUrl(chinazoSeleccionado?.quien_dijo_foto || null)}
                  name={chinazoSeleccionado?.quien_dijo_alias || '?'}
                  className="w-32 h-32 text-4xl"
                />
                <p className="text-xs text-center text-default-400 mt-1">📷 Click para ampliar</p>
              </div>

              <div className="w-full space-y-3">
                <div className="bg-default-100 dark:bg-default-50 p-4 rounded-lg">
                  <p className="text-sm text-default-500 mb-1">Chinazo</p>
                  <p className="text-lg font-medium">{chinazoSeleccionado?.chinazo}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-default-100 dark:bg-default-50 p-3 rounded-lg">
                    <p className="text-sm text-default-500 mb-1">Quién lo dijo</p>
                    <p className="font-medium">{chinazoSeleccionado?.quien_dijo_alias || 'Desconocido'}</p>
                  </div>
                  <div className="bg-default-100 dark:bg-default-50 p-3 rounded-lg">
                    <p className="text-sm text-default-500 mb-1">Fecha</p>
                    <p className="font-medium">{chinazoSeleccionado ? formatearFecha(chinazoSeleccionado.fecha) : ''}</p>
                  </div>
                </div>

                <div className="bg-default-100 dark:bg-default-50 p-3 rounded-lg">
                  <p className="text-sm text-default-500 mb-1">Votos actuales</p>
                  <p className="font-medium text-2xl text-primary">
                    {chinazoSeleccionado?.total_votos || 0}
                  </p>
                </div>

                {/* ✅ Mostrar si es votable o no (CORREGIDO) */}
                {chinazoSeleccionado && (
                  <div className="bg-warning-50 dark:bg-warning-900/20 p-3 rounded-lg">
                    <p className="text-sm text-warning">
                      {convertirFechaAMes(chinazoSeleccionado.fecha) === mesActual ? (
                        chinazoSeleccionado.yaVoto ? (
                          '✅ Ya has votado por este chinazo'
                        ) : (
                          '✅ Este chinazo es del mes actual y se puede votar'
                        )
                      ) : (
                        '🔒 Este chinazo es de un mes anterior y NO se puede votar'
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => {
              // console.log('🔒 [UI] Cerrando modal de detalle (botón Cerrar)');
              cerrarModalDetalle();
            }}>
              Cerrar
            </Button>
            {chinazoSeleccionado && 
             convertirFechaAMes(chinazoSeleccionado.fecha) === mesActual && 
             !chinazoSeleccionado.yaVoto && (
              <Button
                color="primary"
                onPress={() => {
                  // console.log(`🔘 [UI] Click en "Votar" desde modal de detalle para chinazo ID: ${chinazoSeleccionado.id}`);
                  cerrarModalDetalle();
                  setTimeout(() => {
                    // console.log(`🔄 [UI] Abriendo modal de confirmación para chinazo ID: ${chinazoSeleccionado.id}`);
                    abrirModalConfirmacion(chinazoSeleccionado);
                  }, 100);
                }}
                startContent={<CheckCircleIcon className="h-4 w-4" />}
              >
                Votar
              </Button>
            )}
            {chinazoSeleccionado && 
             convertirFechaAMes(chinazoSeleccionado.fecha) === mesActual && 
             chinazoSeleccionado.yaVoto && (
              <Button
                color="success"
                variant="flat"
                isDisabled={true}
                startContent={<CheckCircleIcon className="h-4 w-4" />}
              >
                ✅ Ya votaste
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de confirmación de voto */}
      <Modal isOpen={modalConfirmacionAbierto} onClose={() => {
        // console.log('🔒 [UI] Cerrando modal de confirmación');
        cerrarModalConfirmacion();
      }}>
        <ModalContent>
          <ModalHeader>Confirmar voto</ModalHeader>
          <ModalBody>
            <p>¿Estás seguro de que quieres votar por este chinazo?</p>
            <div className="flex items-center gap-2 mt-2">
              <Avatar
                src={getImageUrl(chinazoSeleccionado?.quien_dijo_foto || null)}
                name={chinazoSeleccionado?.quien_dijo_alias || '?'}
                size="sm"
                className="w-8 h-8"
              />
              <p className="text-sm text-default-500">
                "{chinazoSeleccionado?.chinazo}"
              </p>
            </div>
            <p className="text-sm text-default-500">
              Dicho por: {chinazoSeleccionado?.quien_dijo_alias || 'Desconocido'}
            </p>
            <p className="text-xs text-warning mt-2">
              ⚠️ Solo puedes votar una vez por chinazo
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => {
              // console.log('🔒 [UI] Cancelando voto');
              cerrarModalConfirmacion();
            }}>
              Cancelar
            </Button>
            <Button
              color="primary"
              onPress={() => {
                // console.log(`🔘 [UI] Confirmando voto para chinazo ID: ${chinazoSeleccionado?.id}`);
                confirmarVoto();
              }}
              isLoading={enviandoVoto}
              isDisabled={enviandoVoto}
              startContent={!enviandoVoto && <CheckCircleIcon className="h-4 w-4" />}
            >
              {enviandoVoto ? 'Procesando...' : 'Confirmar voto'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};
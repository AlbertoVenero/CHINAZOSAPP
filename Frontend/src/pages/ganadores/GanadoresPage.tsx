// src/pages/ganadores/GanadoresPage.tsx
import { 
  Card, 
  CardBody, 
  Select, 
  SelectItem, 
  Button,
  Avatar,
  Chip,
  Progress,
  Alert,
  Spinner
} from '@nextui-org/react';
import { 
  TrophyIcon, 
  CalendarIcon, 
  ArrowPathIcon} from '@heroicons/react/24/outline';
import { useGanadoresPage } from './useGanadoresPage';

export const GanadoresPage = () => {
  const {
    ganadores,
    mesSeleccionado,
    mesesDisponibles,
    loading,
    calculando,
    mensaje,
    cargarGanadores,
    calcularGanador,
    mesActual,
    mesAnterior,
    formatearMes,
    cerrarMensaje,
    buscarPorMes,
    limpiarFiltros,
    getImageUrl  // ✅ Importar la función
  } = useGanadoresPage();

  const esMesAnterior = mesSeleccionado === mesAnterior;

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      {/* Card de filtros */}
      <Card>
        <CardBody className="gap-4">
          <h1 className="text-2xl font-bold text-center mb-2">
            <span className="flex items-center justify-center gap-2">
              <TrophyIcon className="h-8 w-8 text-yellow-500" />
              Salón de la Fama
            </span>
          </h1>
          <p className="text-center text-default-500 text-sm">
            Los mejores chinazos de cada mes
          </p>
          
          {/* Mensajes */}
          {mensaje && (
            <Alert
              color={mensaje.tipo === 'success' ? 'success' : 'danger'}
              title={mensaje.texto}
              onClose={cerrarMensaje}
            />
          )}

          <div className="flex flex-wrap gap-4">
            <Select
              label="Filtrar por mes"
              placeholder="Selecciona un mes"
              className="flex-1 min-w-[200px]"
              selectedKeys={mesSeleccionado ? [mesSeleccionado] : []}
              onChange={(e) => buscarPorMes(e.target.value)}
              isDisabled={loading}
            >
              {mesesDisponibles.map((mes) => (
                <SelectItem key={mes.key} value={mes.key} textValue={mes.label}>
                  {mes.label}
                </SelectItem>
              ))}
            </Select>

            <div className="flex flex-wrap gap-2 items-end">
              <Button 
                color="primary" 
                onPress={cargarGanadores}
                isLoading={loading}
                startContent={!loading && <ArrowPathIcon className="h-4 w-4" />}
              >
                Actualizar
              </Button>
              
              {/* ✅ Solo mostrar el botón "Calcular Ganador" si NO hay ganadores o si es el mes anterior */}
              {(!ganadores || ganadores.length === 0 || esMesAnterior) && (
                <Button 
                  color="success" 
                  onPress={calcularGanador}
                  isLoading={calculando}
                  startContent={!calculando && <TrophyIcon className="h-4 w-4" />}
                >
                  {calculando ? 'Calculando...' : 'Calcular Ganador Mes Anterior'}
                </Button>
              )}

              <Button 
                variant="light" 
                onPress={limpiarFiltros}
                isDisabled={loading}
              >
                Limpiar
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Loading */}
      {loading && (
        <Card>
          <CardBody>
            <div className="flex justify-center py-8">
              <Spinner size="lg" label="Cargando ganadores..." />
            </div>
          </CardBody>
        </Card>
      )}

      {/* Grid de ganadores */}
      {!loading && ganadores.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ganadores.map((item) => {
            const ganador = item.ganador || {
              id: item.sicario_id || item.id,
              nombre: item.sicario_nombre || '',
              alias: item.sicario_alias || '',
              chinazo: item.texto_chinazo || '',
              foto: item.sicario_foto || null,
              totalVotos: item.total_votos || 0,
              totalVotantes: item.total_votantes || 0,
              porcentaje: item.porcentaje || 0
            };

            // ✅ Verificar si es el mes actual (no debería tener ganador aún)
            const esMesActualGanador = item.mes === mesActual;

            return (
              <Card 
                key={item.id || item.mes}
                className={`border-2 ${
                  esMesActualGanador 
                    ? 'border-blue-400/50 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10' 
                    : 'border-yellow-400/50 bg-gradient-to-br from-yellow-50 to-yellow-100/50 dark:from-yellow-900/20 dark:to-yellow-800/10'
                } hover:scale-105 transition-transform duration-300`}
              >
                <CardBody className="p-6">
                  <div className="flex flex-col items-center gap-4">
                    {/* Badge de ganador y mes */}
                    <div className="flex items-center gap-2 w-full justify-between">
                      <Chip 
                        color={esMesActualGanador ? 'primary' : 'warning'} 
                        size="sm" 
                        className="font-bold"
                      >
                        {esMesActualGanador ? 'En Proceso' : 'Ganador'}
                      </Chip>
                      <div className="flex items-center gap-1 text-sm text-default-500">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{formatearMes(item.mes)}</span>
                      </div>
                    </div>

                    {/* ✅ CORREGIDO: Usar getImageUrl en lugar de URL hardcodeada */}
                    <div className="flex flex-col items-center gap-2">
                      <Avatar 
                        src={getImageUrl(ganador.foto)}  // ✅ Usando getImageUrl
                        name={ganador.alias}
                        className={`w-24 h-24 text-3xl border-4 ${
                          esMesActualGanador 
                            ? 'border-blue-400' 
                            : 'border-yellow-400'
                        }`}
                      />
                      <div className="text-center">
                        <h3 className="text-xl font-bold">
                          {ganador.alias}
                        </h3>
                        <p className="text-sm text-default-500">{ganador.nombre}</p>
                      </div>
                    </div>

                    {/* El chinazo ganador */}
                    <div className="w-full bg-default-100 dark:bg-default-50 p-3 rounded-lg text-center">
                      <p className="text-sm text-default-500 mb-1">Champions Chinazo</p>
                      <p className="text-sm font-medium line-clamp-2">
                        "{ganador.chinazo}"
                      </p>
                    </div>

                    {/* Estadísticas de votación */}
                    <div className="grid grid-cols-3 gap-2 w-full">
                      <div className="bg-default-100 dark:bg-default-50 p-2 rounded-lg text-center">
                        <p className="text-xs text-default-500">Votos</p>
                        <p className="text-lg font-bold text-primary">
                          {ganador.totalVotos}
                        </p>
                      </div>
                      <div className="bg-default-100 dark:bg-default-50 p-2 rounded-lg text-center">
                        <p className="text-xs text-default-500">Votantes</p>
                        <p className="text-lg font-bold text-primary">
                          {ganador.totalVotantes}
                        </p>
                      </div>
                      <div className="bg-default-100 dark:bg-default-50 p-2 rounded-lg text-center">
                        <p className="text-xs text-default-500">%</p>
                        <p className="text-lg font-bold text-success">
                          {ganador.porcentaje}%
                        </p>
                      </div>
                    </div>

                    {/* Barra de progreso del porcentaje */}
                    <div className="w-full">
                      <Progress 
                        value={ganador.porcentaje} 
                        color="success"
                        className="h-2"
                      />
                    </div>

                    {/* ✅ SOLO mostrar acciones si NO es el mes actual (ya está definido) */}
                    {!esMesActualGanador && (
                      <div className="w-full text-center">

                      </div>
                    )}

                    {/* ✅ Si es el mes actual, mostrar que está en proceso */}
                    {esMesActualGanador && (
                      <div className="w-full text-center">
                        <Chip color="primary" size="sm" variant="flat">
                          ⏳ Mes en curso - Ganador aún no definido
                        </Chip>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {/* Mensaje cuando no hay resultados */}
      {!loading && ganadores.length === 0 && (
        <Card>
          <CardBody>
            <div className="text-center py-12 text-default-500">
              <div className="flex justify-center mb-4">
                <TrophyIcon className="h-16 w-16 text-default-300" />
              </div>
              <p className="text-lg">No hay ganadores registrados</p>
              <p className="text-sm mt-2">
                Haz clic en "Calcular Ganador Mes Anterior" para generar el primer ganador
              </p>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};
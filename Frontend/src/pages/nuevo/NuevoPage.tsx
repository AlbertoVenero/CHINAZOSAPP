// src/pages/nuevo/NuevoPage.tsx
import { 
    Card, 
    CardBody, 
    Input, 
    Select, 
    SelectItem, 
    Button,
    Textarea,
    Avatar,
    Spinner,
    Alert
} from '@nextui-org/react';
import { useNuevoPage } from './useNuevoPage';
import { UserCircleIcon } from '@heroicons/react/24/outline';

export const NuevoPage = () => {
    const {
        sicarios,
        loading,
        error,
        formData,
        setFormData,
        enviando,
        mensaje,
        setMensaje,
        handleSubmit,
        limpiarFormulario,
        getImageUrl,
        user,
        isAuthenticated,
        isGuest
    } = useNuevoPage();

    return (
        <div className="max-w-2xl mx-auto p-4">
            <Card>
                <CardBody className="gap-4">
                    <h1 className="text-xl font-bold text-center mb-2">
                        Nuevo Chinazo
                    </h1>

                    {/* Mostrar quién está anotando */}
                    {isAuthenticated && user && (
                        <div className="flex items-center gap-2 p-3 bg-default-100 rounded-lg">
                            <UserCircleIcon className="h-5 w-5 text-primary" />
                            <span className="text-sm text-default-600">
                                Anotando como: <strong>{user.alias}</strong>
                            </span>
                            {user.foto && (
                                <Avatar
                                    src={getImageUrl(user.foto)}
                                    name={user.alias}
                                    size="sm"
                                    className="w-6 h-6 ml-auto"
                                />
                            )}
                        </div>
                    )}

                    {isGuest && (
                        <Alert
                            color="warning"
                            title="Modo Invitado"
                            description="Debes iniciar sesión para registrar chinazos"
                        />
                    )}

                    {/* Mensaje de éxito/error */}
                    {mensaje && (
                        <Alert
                            color={mensaje.tipo === 'success' ? 'success' : 'danger'}
                            title={mensaje.texto}
                            onClose={() => setMensaje(null)}
                        />
                    )}

                    {/* Error general */}
                    {error && (
                        <Alert
                            color="danger"
                            title="Error"
                            description={error}
                            onClose={() => {}}
                        />
                    )}

                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Spinner size="lg" label="Cargando sicarios..." />
                        </div>
                    ) : sicarios.length === 0 ? (
                        <div className="text-center py-8 text-default-500">
                            <p>No hay sicarios registrados</p>
                            <p className="text-sm mt-2">Debes registrar al menos un sicario antes de crear un chinazo</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Selector: Quién lo dijo */}
                            <Select
                                label="¿Quién lo dijo?"
                                placeholder="Selecciona una persona"
                                selectedKeys={formData.quien_dijo_id ? [formData.quien_dijo_id] : []}
                                onChange={(e) => setFormData({ ...formData, quien_dijo_id: e.target.value })}
                                isRequired
                                isLoading={loading}
                                isDisabled={enviando || !isAuthenticated || isGuest}
                                renderValue={(items) => {
                                    const item = items[0];
                                    const sicario = sicarios.find(s => s.id === parseInt(item?.key as string));
                                    return (
                                        <div className="flex items-center gap-2">
                                            <Avatar 
                                                src={getImageUrl(sicario?.foto || null)}
                                                name={sicario?.alias}
                                                size="sm"
                                                className="w-6 h-6"
                                            />
                                            <span>{sicario?.alias}</span>
                                        </div>
                                    );
                                }}
                            >
                                {sicarios.map((sicario) => (
                                    <SelectItem 
                                        key={sicario.id} 
                                        value={String(sicario.id)}
                                        textValue={sicario.alias}  // ✅ AGREGADO
                                    >
                                        <div className="flex items-center gap-2">
                                            <Avatar 
                                                src={getImageUrl(sicario.foto || null)}
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

                            {/* El chinazo */}
                            <Textarea
                                label="El chinazo"
                                placeholder="Escribe lo que dijo..."
                                value={formData.chinazo}
                                onChange={(e) => setFormData({ ...formData, chinazo: e.target.value })}
                                minRows={4}
                                isRequired
                                isDisabled={enviando || !isAuthenticated || isGuest}
                                description="Máximo 500 caracteres"
                                maxLength={500}
                            />

                            {/* Fecha */}
                            <Input
                                type="date"
                                label="Fecha"
                                value={formData.fecha}
                                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                                isRequired
                                isDisabled={enviando || !isAuthenticated || isGuest}
                            />

                            {/* Campo informativo */}
                            {isAuthenticated && user && (
                                <div className="text-xs text-default-400">
                                    <span>Anotado automáticamente por: <strong>{user.alias}</strong></span>
                                </div>
                            )}

                            {/* Botones */}
                            <div className="flex gap-2 pt-2">
                                <Button 
                                    type="submit" 
                                    color="primary" 
                                    className="flex-1"
                                    size="lg"
                                    isLoading={enviando}
                                    isDisabled={enviando || sicarios.length === 0 || !isAuthenticated || isGuest}
                                >
                                    {enviando ? 'Guardando...' : 'Guardar Chinazo'}
                                </Button>
                                <Button 
                                    variant="light" 
                                    onPress={limpiarFormulario}
                                    className="flex-1"
                                    size="lg"
                                    isDisabled={enviando || !isAuthenticated || isGuest}
                                >
                                    Limpiar
                                </Button>
                            </div>

                            {/* Mensaje para invitados */}
                            {isGuest && (
                                <div className="text-center text-sm text-warning">
                                    <p>⚠️ Los invitados no pueden crear chinazos</p>
                                    <p className="text-xs">Inicia sesión para registrar nuevos chinazos</p>
                                </div>
                            )}
                        </form>
                    )}
                </CardBody>
            </Card>
        </div>
    );
};
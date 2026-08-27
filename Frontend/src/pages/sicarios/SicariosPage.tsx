// src/pages/sicarios/SicariosPage.tsx
import {
    Card,
    CardBody,
    Input,
    Button,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Chip,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Avatar,
    Spinner,
    Alert
} from '@nextui-org/react';
import { PencilIcon, TrashIcon, UserPlusIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useSicariosPage } from './useSicariosPage';

export const SicariosPage = () => {
    const {
        // Estados
        sicarios,
        loading,
        error,
        formData,
        fotoSeleccionada,
        modalAbierto,
        modalFotoAbierto,
        fotoParaModal,
        aliasParaModal,
        sicarioEditando,
        enviando,
        fileInputRef,

        // Funciones
        abrirModal,
        cerrarModal,
        abrirModalFoto,
        cerrarModalFoto,
        handleFotoChange,
        eliminarFoto,
        handleGuardar,
        handleEliminar,
        setFormData,
        getImageUrl,
    } = useSicariosPage();

    return (
        <div className="max-w-6xl mx-auto p-4 space-y-4">
            {/* Card de título y botón agregar */}
            <Card>
                <CardBody className="flex flex-row justify-between items-center">
                    <h1 className="text-xl font-bold">Gestión de Sicarios</h1>
                    <Button
                        color="primary"
                        onPress={() => abrirModal()}
                        startContent={<UserPlusIcon className="h-5 w-5" />}
                    >
                        Agregar Sicario
                    </Button>
                </CardBody>
            </Card>

            {/* Mensaje de error */}
            {error && (
                <Alert
                    color="danger"
                    title="Error"
                    description={error}
                    onClose={() => { }}
                />
            )}

            {/* Card de tabla */}
            <Card>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <Spinner size="lg" label="Cargando sicarios..." />
                    </div>
                ) : sicarios.length > 0 ? (
                    <Table aria-label="Tabla de sicarios">
                        <TableHeader>
                            <TableColumn>Foto</TableColumn>
                            <TableColumn>Alias</TableColumn>
                            <TableColumn>Nombre</TableColumn>
                            <TableColumn>Acciones</TableColumn>
                        </TableHeader>
                        <TableBody>
                            {sicarios.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <div
                                            className="cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={() => abrirModalFoto(item.foto, item.alias)}
                                        >
                                            <Avatar
                                                src={getImageUrl(item.foto)}
                                                name={item.alias}
                                                size="sm"
                                                className="w-10 h-10"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Chip color="primary" size="sm" className="font-bold">
                                            {item.alias}
                                        </Chip>
                                    </TableCell>
                                    <TableCell className="text-default-500 text-sm">
                                        {item.nombre}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="light"
                                                onPress={() => abrirModal(item)}
                                                startContent={<PencilIcon className="h-4 w-4" />}
                                            >
                                                Editar
                                            </Button>
                                            <Button
                                                size="sm"
                                                color="danger"
                                                variant="light"
                                                onPress={() => handleEliminar(item.id)}
                                                startContent={<TrashIcon className="h-4 w-4" />}
                                            >
                                                Eliminar
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="text-center py-8 text-default-500">
                        No hay sicarios registrados
                    </div>
                )}

            </Card>

            {/* Modal para agregar/editar */}
            <Modal isOpen={modalAbierto} onClose={cerrarModal} size="2xl">
                <ModalContent>
                    <ModalHeader>
                        {sicarioEditando ? 'Editar Sicario' : 'Agregar Nuevo Sicario'}
                    </ModalHeader>
                    <ModalBody>
                        <div className="flex flex-col gap-4">
                            {/* Avatar con previsualización */}
                            <div className="flex items-center gap-4">
                                <Avatar
                                    src={fotoSeleccionada || undefined}
                                    name={formData.alias || 'Usuario'}
                                    className="w-20 h-20"
                                />
                                <div>
                                    <div className="flex flex-col gap-2">
                                        <Button
                                            color="primary"
                                            variant="flat"
                                            onPress={() => fileInputRef.current?.click()}
                                            startContent={<PhotoIcon className="h-5 w-5" />}
                                            size="sm"
                                        >
                                            Seleccionar foto
                                        </Button>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleFotoChange}
                                        />
                                        {fotoSeleccionada && (
                                            <Button
                                                size="sm"
                                                variant="light"
                                                color="danger"
                                                onPress={eliminarFoto}
                                            >
                                                Eliminar foto
                                            </Button>
                                        )}
                                    </div>
                                    <p className="text-xs text-default-400 mt-1">
                                        Formatos: JPG, PNG, GIF (máx. 2MB)
                                    </p>
                                </div>
                            </div>

                            <Input
                                label="Alias"
                                placeholder="Ingresa el alias"
                                value={formData.alias}
                                onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                                isRequired
                                className="font-bold"
                                isDisabled={enviando}
                            />
                            <Input
                                label="Nombre"
                                placeholder="Ingresa el nombre"
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                isRequired
                                isDisabled={enviando}
                            />
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            variant="light"
                            onPress={cerrarModal}
                            isDisabled={enviando}
                        >
                            Cancelar
                        </Button>
                        <Button
                            color="primary"
                            onPress={handleGuardar}
                            isLoading={enviando}
                            isDisabled={enviando}
                        >
                            {enviando ? 'Guardando...' : (sicarioEditando ? 'Actualizar' : 'Guardar')}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

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
                            {/* Botón cerrar */}
                            <Button
                                isIconOnly
                                variant="light"
                                className="absolute top-4 right-4 text-white hover:bg-white/20 z-50"
                                onPress={cerrarModalFoto}
                            >
                                <XMarkIcon className="h-8 w-8" />
                            </Button>

                            {/* Imagen */}
                            {fotoParaModal ? (
                                <img
                                    src={fotoParaModal}
                                    alt={aliasParaModal}
                                    className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
                                    onError={(e) => {
                                        console.error('Error al cargar imagen:', e);
                                        (e.target as HTMLImageElement).src = '';
                                    }}
                                />
                            ) : (
                                <div className="text-white text-center">
                                    <p className="text-4xl mb-4">📷</p>
                                    <p className="text-xl">No hay foto disponible</p>
                                </div>
                            )}

                            {/* Alias */}
                            <div className="mt-6 text-center">
                                <span className="text-2xl font-bold text-white bg-black/60 px-6 py-2 rounded-full backdrop-blur-sm">
                                    @{aliasParaModal}
                                </span>
                            </div>
                        </div>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
};
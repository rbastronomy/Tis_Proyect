import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  Button 
} from "@nextui-org/react";
import PropTypes from 'prop-types';

export function FormModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  title, 
  children,
  submitLabel = "Guardar",
  cancelLabel = "Cancelar",
  size = "2xl",
  isSubmitting = false,
  submitButtonColor = "primary",
  isDismissable = true
}) {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size={size}
      isDismissable={isDismissable && !isSubmitting}
      classNames={{
        base: "bg-white dark:bg-gray-900",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <form onSubmit={onSubmit}>
            <ModalHeader className="flex flex-col gap-1">
              {title}
            </ModalHeader>
            <ModalBody>
              {children}
            </ModalBody>
            <ModalFooter>
              <Button 
                color="danger" 
                variant="light" 
                onPress={onClose}
                isDisabled={isSubmitting}
              >
                {cancelLabel}
              </Button>
              <Button 
                color={submitButtonColor}
                type="submit"
                isLoading={isSubmitting}
              >
                {submitLabel}
              </Button>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
}

FormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  submitLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg', '2xl', '3xl', '4xl', '5xl', 'full']),
  isSubmitting: PropTypes.bool,
  submitButtonColor: PropTypes.string,
  isDismissable: PropTypes.bool
}; 
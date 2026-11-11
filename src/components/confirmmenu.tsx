import "../styles/confirm-menu-style.css"
export interface ConfirmMenuProps {
    deleteTitle?: string,
    deleteContext?: string,
    onConfirm?: any,
    onClose?: any
}

export default function ConfirmMenuPopUp({deleteTitle = "", deleteContext = "", onConfirm, onClose} : ConfirmMenuProps) {

    const onConfirmDelete = () => {
        onConfirm();
        onClose();
    }

    return (
        <div id="background-blur">
            <div id="confirm-menu-container">
                <div id="delete-warning-icon">!</div>

                <h1 id="delete-warning-title">{deleteTitle.length > 20
                                        ? deleteTitle.slice(0, 20) + "..."
                                        : deleteTitle}</h1>
                <p id="delete-warning-context">{deleteContext}</p>

                <div id="confirm-menu-btn-container">
                    <button id="confirm-menu-keep-btn" onClick={onClose}>KEEP IT</button>
                    <button id="confirm-menu-confirm-btn" onClick={onConfirmDelete}>DELETE</button>
                </div>
            </div>
        </div>
    );
}
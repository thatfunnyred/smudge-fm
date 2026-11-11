import "../styles/confirm-menu-style.css"
import { loader } from "./MusicLoader";
export interface ConfirmMenuProps {
    deleteTitle?: string,
    deleteContext?: string,
    confirmBtn?: string,
    cancelBtn?: string,
    onConfirm?: any,
    onClose?: any
}

export default function ConfirmMenuPopUp({deleteTitle = "", deleteContext = "", confirmBtn = "", cancelBtn = "", onConfirm, onClose} : ConfirmMenuProps) {

    const onConfirmDelete = async () => {

        loader.show();

        await onConfirm();
        await onClose();
        
        loader.hide();
    }

    return (
        <div id="confirm-background-blur">
            <div id="confirm-menu-container">
                <div id="delete-warning-icon">!</div>

                <h1 id="delete-warning-title">{deleteTitle.length > 20
                                        ? deleteTitle.slice(0, 20) + "..."
                                        : deleteTitle}</h1>
                <p id="delete-warning-context">{deleteContext}</p>

                <div id="confirm-menu-btn-container">
                    <button id="confirm-menu-keep-btn" onClick={onClose}>{cancelBtn}</button>
                    <button id="confirm-menu-confirm-btn" onClick={onConfirmDelete}>{confirmBtn}</button>
                </div>
            </div>
        </div>
    );
}
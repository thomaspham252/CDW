import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faShoppingCart,
    faUser,
    faHeart,
    faStar,
    faTrash,
    faPlus,
    faMinus,
    faHome,
    faBox,
    faSignOutAlt,
    faSignInAlt,
    faUserPlus,
    faSearch,
    faFilter,
    faChevronRight,
    faChevronLeft,
    faCheck,
    faTimes,
    faEdit,
    faPhone,
    faEnvelope,
    faMapMarkerAlt,
    faCreditCard,
    faTruck,
    faShieldAlt,
    faUndo,
    faClock,
    faCheckCircle,
    faExclamationTriangle,
    faBars,
    faTimes as faClose,
    faShoppingBag,
    faTag,
    faGift,
    faHeadset,
    faAddressBook,

    // 🔹 ICON MỚI
    faBell,          // Thông báo
    faTicket,        // Voucher
    faComments,      // Chat
    faPaperPlane,    // Gửi tin nhắn
    faGlobe,         // Ngôn ngữ
    faTrophy         // Điểm thưởng
} from '@fortawesome/free-solid-svg-icons';

import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';

// Brand icons
import {
    faFacebook as faFacebookBrand,
    faGoogle as faGoogleBrand
} from '@fortawesome/free-brands-svg-icons';

// Export FontAwesome component
export { FontAwesomeIcon };

// Export all icons
export const icons = {
    // Navigation
    home: faHome,
    products: faBox,
    cart: faShoppingCart,
    user: faUser,
    logout: faSignOutAlt,
    login: faSignInAlt,
    register: faUserPlus,
    contact: faAddressBook,

    // Actions
    heart: faHeart,
    heartRegular: faHeartRegular,
    star: faStar,
    trash: faTrash,
    plus: faPlus,
    minus: faMinus,
    edit: faEdit,
    search: faSearch,
    filter: faFilter,
    check: faCheck,
    times: faTimes,
    close: faClose,

    // Navigation arrows
    chevronRight: faChevronRight,
    chevronLeft: faChevronLeft,

    // Contact
    phone: faPhone,
    email: faEnvelope,
    location: faMapMarkerAlt,

    // Payment & Shipping
    creditCard: faCreditCard,
    truck: faTruck,
    shield: faShieldAlt,

    // Status
    clock: faClock,
    checkCircle: faCheckCircle,
    warning: faExclamationTriangle,
    undo: faUndo,

    // UI
    bars: faBars,
    shoppingBag: faShoppingBag,
    tag: faTag,
    gift: faGift,
    headset: faHeadset,

    // 🔹 ICON MỚI
    bell: faBell,
    ticket: faTicket,
    comments: faComments,
    paperPlane: faPaperPlane,
    globe: faGlobe,
    trophy: faTrophy,

    // Social
    facebook: faFacebookBrand,
    google: faGoogleBrand
};

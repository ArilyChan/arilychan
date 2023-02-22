import { LocalMailAddressInterface } from '../../types';
export declare abstract class BaseIO {
    abstract mail: LocalMailAddressInterface;
    readyState: Boolean;
}

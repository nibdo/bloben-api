import {ImportMock} from "ts-mock-imports";
import {calDavSyncBullQueue} from "../../service/BullQueue";

export const mockBullQueue = () => {
    const mockManager = ImportMock.mockClass(calDavSyncBullQueue, 'calDavSyncBullQueue');
// @ts-ignore
    mockManager.set('add', () => {
        return
    })
}

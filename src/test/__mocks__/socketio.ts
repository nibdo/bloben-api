import {io} from "../../app";

export const mockSocketio = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // @ts-ignore
    io = {
        to: () => {
            return {
                emit: () => {
                    return;
                },
            };
        },
    };
}

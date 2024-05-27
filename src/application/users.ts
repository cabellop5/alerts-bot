import { storeData } from "../infrastructure/users-repository"
import { usersInServer } from "../infrastructure/discord/discord-notifications"

export const users = async (): Promise<void> => {
    const users = await usersInServer()
    if (users.length >= 1) {
        const item = {
            count: users.length,
            users
        }
        await storeData(item)
    }
}
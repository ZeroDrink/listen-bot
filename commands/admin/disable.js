const fs = require('fs')

function write_obj(guilds_list, message, helper) {
    fs.writeFile('./json/guilds.json', JSON.stringify(guilds_list), (err) => {
        if (err) console.log(err)
        helper.log(message, '  wrote guilds list object successfully')
    }) 
}

module.exports = (message, client, helper) => {
    if (message.content) {
        let to_disable = message.content.split(' ')
        let _disabled = []
        for (cmd of to_disable) {
            if (require('../../consts').cmdlist.indexOf(cmd) != -1) {
                client.guilds_list[message.guild.id].disabled[message.channel.id].push(cmd)
                _disabled.push(cmd)
            }
        }

        if (_disabled.length > 0) {
            write_obj(client.guilds_list, message, helper)
            client.createMessage(message.channel.id, `:ok_hand: disabled ${_disabled.join(', ')}`)
        }
    } else {
        if (client.guilds_list[message.guild.id].disabled[message.channel.id].length > 0) {
            let send = `List of disabled commands: \`${client.guilds_list[message.guild.id].disabled[message.channel.id].join('\`, \`')}\``
            client.createMessage(message.channel.id, send)
        } else {
            client.createMessage(message.channel.id, "No disabled commands for this channel.")
        }
    }
}
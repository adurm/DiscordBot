module.exports = { handleCommand, roleAssign, helpRoom, welcomeMessage, deleteInviteLinks }
const config = require('./config.json');
const { templates, objects } = require('./constants')

var command, args
var code = 'N/A', region = 'N/A', host = ''
var muted = false;

const regions = ['eu', 'europe', 'america', 'na', 'asia', 'as']
let map = new Map()
map['AmongUs'] = 'crewmate gang'
map['⚔️'] = 'summoners'
map['🎵'] = 'music quiz'
map['🖌️'] = 'pictionary'
map['🔫'] = 'valorant'
map['🚗'] = 'car football'
map['♟️'] = 'chess'

function handleCommand(message, embed) {

    args = message.content.slice(config.prefix.length).trim().split(' ');
    command = args.shift().toLowerCase();

    switch(command) {
        case 'code':
            commandCode(message, embed);
        break;

        case 'setcode':
            commandSetCode(message);
        break;

        case 'resetcode':
            commandResetCode(message);
        break;

        case 'roles':
            commandRoles(message);
        break;

        case 'helprooms':
            commandHelpRooms(message)
        break;

        case 'clear':
            commandClear(message);
        break;

        case 'move':
            commandMove(message);
        break;

        case 'mute':
            commandMute(message);
        break;
    }

}

function commandCode(message, embed) {

    let hostName = (host == '') ? "N/A" : host.username

    embed.setTitle("__**Among Us**__")
    embed.setDescription("**Code:** " + code.toUpperCase() + "\n**Region:** " + region.charAt(0).toUpperCase() + region.slice(1))
    embed.attachFiles(['./media/servericon.png'])
    embed.setThumbnail("attachment://servericon.png")
    embed.setColor(0xffa20d)
    embed.setTimestamp()

    if (host == '') {
        embed.setFooter('Lobby Host: ' + hostName)
    } else {
        embed.setFooter('Lobby Host: ' + hostName, host.avatarURL())
    }


    message.channel.send(embed)
}

function commandSetCode(message) {

    if (args.length < 2) {
        message.channel.send("Invalid format. Please use !setcode {code} {region}")
        return;
    }

    let testcode = args[0];
    let testregion = args[1].toLowerCase();

    if (testcode.length != 6 || testcode.match(/\d/)) {
        message.channel.send("Code must be 6 letters.")
    } else {
        code = testcode
        if (!regions.includes(testregion)) {
            message.channel.send("Region must be eu, na or as.")
        } else {
            host = message.author
            region = setRegion(testregion)
            message.channel.send("Code set.")
        }
    }

}

function commandResetCode(message) {
    code = 'N/A';
    region = 'N/A';
    host = '';
    message.channel.send('Code reset.');
}

function commandRoles(message) {
    if (message.author.id != objects.adamID) {
        return;
    }
    message.channel.send(templates.roleReactions).then(sentMsg => {
        sentMsg.react("<:amongus:768924238555643925>")
        sentMsg.react("⚔️")
        sentMsg.react("🎵")
        sentMsg.react("🖌️")
        sentMsg.react("🔫")
        sentMsg.react("🚗")
        sentMsg.react("♟️")
    });
}

function commandHelpRooms(message) {
    if (message.author.id != objects.adamID) {
        return;
    }
    message.channel.send(templates.helpRooms).then(sentMsg => {
        sentMsg.react("<:cheeseconfused:756791734989488179>")
    });
}

function commandClear(message) {

    let num = "" + args[0]
    if (message.member.hasPermission("MANAGE_MESSAGES")
        && !isNaN(num) && !isNaN(parseFloat(num)) && num <= 100 && num >= 1){
            message.channel.bulkDelete(num)

    }
}

function commandMove(message) {
    if (message.member.voice.channel && message.member.hasPermission("MOVE_MEMBERS")) {
        message.guild.members.cache.forEach(member => {
            if (member.voice.channel) member.voice.setChannel(message.member.voice.channel);
        });
    }
}

function commandMute(message) {
    if (message.member.voice.channel && message.member.hasPermission("MUTE_MEMBERS")) {
        muted = !muted
        message.member.voice.channel.members.forEach(member => {
            member.voice.setMute(muted);
        });
    }
}

function setRegion(region) {
    if (region == 'eu' || region == 'europe') {
        return 'Europe'
    } else if (region == 'na' || region == 'america') {
        return 'North America'
    } else if (region == 'as' || region == 'asia') {
        return 'Asia'
    }
}

function roleAssign(reaction, user, add, server) {
    if (reaction.message.channel.name == 'self-assign-roles' && user.id != objects.botID && reaction.emoji.name in map) {
        let role = server.roles.cache.find(role => role.name === map[reaction.emoji.name]);
        let usersRoles = server.members.cache.get(user.id).roles
        add ? usersRoles.add(role) : usersRoles.remove(role)
    }
}

function helpRoom(reaction, user, server) {
    if (reaction.message.channel.name == 'contact-an-admin' && user.id != objects.botID && reaction.emoji.name == 'CheeseConfused') {
        server.channels.create(user.username + "-help-room").then(channel => {
            channel.setParent(objects.helpRoomCategoryID)
            channel.overwritePermissions([
                { id: objects.roleMemberID, deny: ['VIEW_CHANNEL'] },
                { id: objects.roleEveryoneID, deny: ['VIEW_CHANNEL'] },
                { id: user.id, allow: ['VIEW_CHANNEL'] }
            ])
            channel.send("Hello <@" + user.id + ">! " + templates.helpRoomIntro)
        })
    }
}

function welcomeMessage(member, channel) {
    channel.send(templates.welcome1Part1 + member.id + templates.welcome1Part2);
}

function deleteInviteLinks(message) {
    if (message.member.hasPermission("ADMINISTRATOR")) return;
    message.delete()
    message.channel.send('Please do not advertise other servers here.');
}

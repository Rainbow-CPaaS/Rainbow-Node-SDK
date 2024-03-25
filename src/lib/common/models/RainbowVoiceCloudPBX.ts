"use strict";

export {};

/**
 * @typedef {'hunting_group'|'manager_assistant'} HuntingGroupType
 */
/**
 * @typedef {'default'|'hg_attendant'|'manager_assistant'} HuntingGroupSubType
 */
/**
 * @typedef {'connected'|'disconnected'|'deskphone'|'unknown'} HuntingGroupMemberConnection
 */
/**
 * @typedef {'serial'|'parallel'|'circular'} HuntingGroupPolicy
 */
/**
 * @typedef {'all'|'external_only'|'internal_only'|'none'} HuntingGroupProfiles
 */
/**
 * @typedef {'agent'|'manager'|'leader'|'assistant'} HuntingGroupMemberRole
 */
//type MemberRole = 'agent'|'manager'|'leader'|'assistant';
/**
 * @typedef {'active'|'idle'} HuntingGroupMemberStatus
 */
//type MemberStatus = 'active' | 'idle';

    /**
     * @class
     * @name HuntingGroup
     * @description
     *      Class representing a hunting group.
     * @public
     * @property  {String} name                     Hunting group name - displayed on the caller phone set
     * @property  {String} shortNumber              Internal Number of the new cloud PBX hunting group
     * @property  {String} type (hunting_group)  Group type. hunting_group,manager_assistant
     * <br/>
     * <br/> Note that <b>manager_assistant</b> is <b>DEPRECATED</b>. See manager_assistant subType
     * <br/>
     * @property  {HuntingGroupSubType} subType (default)  Group sub type, only Voice attendant users can be part of hg_attendant group and can not be part of default group
     * @property  {HuntingGroupPolicy} policy (parallel)  Hunting group policy - only parallel policy for hg_attendant hunting group, only serial for manager_assistant
     * @property  {(5-30)} timeout (10)  Timeout in seconds after which the next member of the hunting group will be selected (ringing) - applicable to serial or circular hunting group type only
     * @property  {Boolean} isEmergencyGroup (false) Is this Hunting group the emergency group of the associated Cloud PBX
     * @property  {Boolean} isEmptyAllowed (true) Indicates if the last active member of the hunting group can leave the group or not
     * @property  {Boolean} isDDIUpdateByManagerAllowed (true) Indicates if changing the DDI of this hunting group by a manager is allowed or not
     * @property  {GroupMember[]} members     List of group members.  In case of serial hunt group policy, or for several assistants, the order is the ringing order
     */
class HuntingGroup {
        name: string;
        shortNumber: string;
        type?: "hunting_group" | "manager_assistant";
        subType?: "default" | "hg_attendant" | "manager_assistant";
        policy?: "serial" | "parallel" | "circular";
        timeout?: number;
        isEmergencyGroup?: boolean;
        isEmptyAllowed?: boolean;
        isDDIUpdateByManagerAllowed?: boolean;
        members: GroupMember[];
    }


/**
 * @class
 * @name GroupMember
 * @description
 *      Class representing a group member.
 * @public
 * @property {String} memberId  Member (user) unique identifier
 * @property  {Array<HuntingGroupMemberRole>} roles (["agent"])  Member role inside the group.
 * @property  { HuntingGroupMemberStatus} status (active)  Member status inside the group

 */
class GroupMember {
    memberId: string;
    roles?: ('agent'|'manager'|'leader'|'assistant') [];
    status?: 'active'|'idle';
}

//module.exports = {'HuntingGroup' : HuntingGroup, "GroupMember" : GroupMember};
//export type {HuntingGroup as HuntingGroup, GroupMember as GroupMember};
export {HuntingGroup as HuntingGroup, GroupMember as GroupMember};
module.exports.HuntingGroup = HuntingGroup;
module.exports.GroupMember = GroupMember;

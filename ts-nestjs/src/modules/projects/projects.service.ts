import { Injectable } from '@nestjs/common'
import { DkResult, r } from 'lib/daybreak'
import { PrismaService } from 'setup/db/prisma.service'
import { Project } from '.prisma/client'
import { UserService } from 'modules/user/user.service'

@Injectable()
export class ProjectsService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly userSvc: UserService
  ) { }

  public async create (data: { title: string }, userID: string | null | undefined): Promise<DkResult<Project>> {

    const [canCreateProj, user] = await this.userSvc.canCreateProjects(userID)
    if (!canCreateProj) return r.fail('UNAUTHORISED')

    return this.prisma.wrapResult(this.prisma.project.create({
      data: {
        ownerID: user!.id,
        title: data.title,
      }
    })).then((result) => {
      if (!result.ok) return result
      return this.prisma.wrapResult(this.prisma.userProject.create({
        data: {
          userID: user!.id,
          projectID: result.data.id,
          permission: 'OWNER'
        }
      })).then((upR) => {
        if (!upR.ok) return upR
        return result
      })
    })
  }
}

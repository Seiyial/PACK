import { Controller, Get, Post, Body, Patch, Param, Delete, Session } from '@nestjs/common'
import { ProjectsService } from './projects.service'
import { V } from 'lib/daybreak/obj-lib/DkJSONValidator'
import { DkResult, r } from 'lib/daybreak'
import { UserService } from 'modules/user/user.service'
import { AppSession } from 'modules/auth/auth.types'

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly userSvc: UserService
  ) { }

  @Post()
  public async create (
    @Body() body: unknown,
    @Session() session: AppSession
  ): Promise<DkResult<{ id: string, title: string }>> {
    const payload = new V<{ title: string }>(body, 'object', ['title'])
      .validate('title', V.isNonEmptyString)
      .acceptIfValid()
    if (!payload.ok) return payload
    const newProject = await this.projectsService.create(payload.data, session.userID)
    if (!newProject.ok) return newProject
    return r.pass({
      id: newProject.data.id,
      title: newProject.data.title
    })
  }

}

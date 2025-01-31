using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Backend.Middleware
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
    public class AuthorizeAttribute : Attribute, IAuthorizationFilter
    {
        public void OnAuthorization(AuthorizationFilterContext context)
        {
            var userId = context.HttpContext.Items["UserId"];
            if (userId == null)
            {
                // No autorizado
                context.Result = new JsonResult(new { message = "No autorizado" })
                {
                    StatusCode = StatusCodes.Status401Unauthorized
                };
            }
        }
    }
}